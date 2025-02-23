<?php

namespace App\Controller;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Component\Security\Core\Exception\BadCredentialsException;
use Symfony\Component\Security\Core\User\UserProviderInterface;

#[Route('/api', name: 'api_')]
class AuthController extends AbstractController
{
    #[Route('/register', name: 'register', methods: ['POST'])]
    public function register(Request $request, UserPasswordHasherInterface $hasher, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (empty($data['username']) || empty($data['password'])) {
            return new JsonResponse(['message' => 'Invalid data'], 400);
        }

        $existingUser = $em->getRepository(User::class)->findOneBy(['username' => $data['username']]);
        if ($existingUser) {
            return new JsonResponse(['message' => 'Username already taken'], 400);
        }

        $user = new User();
        $user->setUsername($data['username']);
        $user->setPassword($hasher->hashPassword($user, $data['password']));
        $user->setShinyOdds(512);

        $em->persist($user);
        $em->flush();

        return new JsonResponse(['message' => 'User registered successfully'], 201);
    }

    #[Route('/login', name: 'login', methods: ['POST'])]
    public function login(
        Request $request,
        UserProviderInterface $userProvider,
        UserPasswordHasherInterface $hasher,
        JWTTokenManagerInterface $JWTManager,
        EntityManagerInterface $em
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);

        if (empty($data['username']) || empty($data['password'])) {
            return new JsonResponse(['message' => 'Invalid credentials'], 400);
        }

        $user = $em->getRepository(User::class)->findOneBy(['username' => $data['username']]);

        if (!$user || !$hasher->isPasswordValid($user, $data['password'])) {
            throw new BadCredentialsException('Invalid username or password');
        }

        $token = $JWTManager->create($user);

        return new JsonResponse(['token' => $token], 200);
    }
    #[Route('/user-stats', name: 'user_stats', methods: ['GET'])]
    public function userStats(): JsonResponse
    {
        $user = $this->getUser();
        if (!$user instanceof User) {
            return new JsonResponse(['message' => 'Unauthorized'], 401);
        }

        return new JsonResponse([
            'username' => $user->getUsername(),
            'pokeballs' => $user->getPokeballs(),
            'pokecoins' => $user->getPokecoins(),
        ], 200);
    }
}
