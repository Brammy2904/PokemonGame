<?php

namespace App\Controller;

use App\Entity\Pokemon;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Contracts\HttpClient\HttpClientInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Session\SessionInterface;
use Psr\Log\LoggerInterface;

#[Route('/api', name: 'api_')]
class PokemonController extends AbstractController
{
    private HttpClientInterface $httpClient;

    public function __construct(HttpClientInterface $httpClient)
    {
        $this->httpClient = $httpClient;
    }

    #[Route('/catch', name: 'catch', methods: ['POST'])]
    #[IsGranted('ROLE_USER')]
    public function catchPokemon(EntityManagerInterface $em): JsonResponse
    {
        $user = $this->getUser();
        if (!$user instanceof User) {
            return new JsonResponse(['message' => 'Unauthorized'], 401);
        }

        if ($user->getPokeballs() <= 0) {
            return new JsonResponse(['message' => 'You have no Pokéballs left!'], 400);
        }

        $user->setPokeballs($user->getPokeballs() - 1);

        $pokemonId = rand(1, 1010);

        $response = $this->httpClient->request('GET', "https://pokeapi.co/api/v2/pokemon/{$pokemonId}");
        if ($response->getStatusCode() !== 200) {
            return new JsonResponse(['message' => 'Failed to fetch Pokémon data'], 500);
        }

        $pokemonData = $response->toArray();
        $pokemonName = ucfirst($pokemonData['name']);
        $isShiny = rand(1, $user->getShinyOdds()) === 1;
        $image = $isShiny ? $pokemonData['sprites']['front_shiny'] : $pokemonData['sprites']['front_default'];

        if (rand(1, 100) <= 30) {
            return new JsonResponse(['message' => "$pokemonName escaped! 😔"], 200);
        }

        $existingPokemon = $em->getRepository(Pokemon::class)->findOneBy([
            'owner' => $user,
            'name' => $pokemonName,
            'isShiny' => $isShiny
        ]);

        if ($existingPokemon) {
            $existingPokemon->setQuantity($existingPokemon->getQuantity() + 1);
        } else {
            $pokemon = new Pokemon();
            $pokemon->setName($pokemonName);
            $pokemon->setImage($image);
            $pokemon->setIsShiny($isShiny);
            $pokemon->setQuantity(1);
            $pokemon->setOwner($user);
            $em->persist($pokemon);
        }

        $user->setPokecoins($user->getPokecoins() + 5);
        $em->flush();

        return new JsonResponse(['message' => "You caught a $pokemonName! 🎉"], 200);
    }

    #[Route('/pokemon', name: 'get_pokemon', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    public function getPokemon(EntityManagerInterface $em): JsonResponse
    {
        $user = $this->getUser();
        if (!$user instanceof User) {
            return new JsonResponse(['message' => 'Unauthorized'], 401);
        }

        $pokemonList = $em->getRepository(Pokemon::class)->findBy(['owner' => $user]);

        $pokemonData = array_map(fn($pokemon) => [
            'name' => strtolower($pokemon->getName()),
            'isShiny' => $pokemon->getIsShiny(),
            'image' => $pokemon->getImage(),
            'quantity' => $pokemon->getQuantity(),
        ], $pokemonList);

        return new JsonResponse($pokemonData, 200);
    }

    #[Route('/transfer', name: 'transfer', methods: ['POST'])]
    #[IsGranted('ROLE_USER')]
    public function transferPokemon(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $user = $this->getUser();
        if (!$user instanceof User) {
            return new JsonResponse(['message' => 'Unauthorized'], 401);
        }

        $data = json_decode($request->getContent(), true);
        if (empty($data['name'])) {
            return new JsonResponse(['message' => 'Invalid data'], 400);
        }

        $pokemon = $em->getRepository(Pokemon::class)->findOneBy([
            'owner' => $user,
            'name' => $data['name']
        ]);

        if (!$pokemon) {
            return new JsonResponse(['message' => 'Pokémon not found'], 404);
        }

        $pokecoinReward = $pokemon->getIsShiny() ? 50 : 10;
        $user->setPokecoins($user->getPokecoins() + $pokecoinReward);

        $em->remove($pokemon);
        $em->flush();

        return new JsonResponse(['message' => 'Pokémon transferred!', 'pokecoins' => $pokecoinReward], 200);
    }

    #[Route('/buy-pokeballs', name: 'buy_pokeballs', methods: ['POST'])]
    #[IsGranted('ROLE_USER')]
    public function buyPokeballs(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $user = $this->getUser();
        if (!$user instanceof User) {
            return new JsonResponse(['message' => 'Unauthorized'], 401);
        }

        $cost = 10;
        if ($user->getPokecoins() < $cost) {
            return new JsonResponse(['message' => 'Not enough PokéCoins!'], 400);
        }

        $user->setPokeballs($user->getPokeballs() + 5);
        $user->setPokecoins($user->getPokecoins() - $cost);

        $em->flush();

        return new JsonResponse(['message' => 'Purchased 5 Pokéballs!'], 200);
    }

    #[Route('/encounter', name: 'encounter', methods: ['POST'])]
    #[IsGranted('ROLE_USER')]
    public function encounterPokemon(EntityManagerInterface $em, SessionInterface $session, LoggerInterface $logger): JsonResponse
    {
        $user = $this->getUser();
        if (!$user instanceof User) {
            return new JsonResponse(['message' => 'Unauthorized'], 401);
        }
        if (!$session->isStarted()) {
            $session->start();
        }
        $sessionId = $session->getId();

        $logger->info("[Encounter] Initial session state:", [
            'session_id' => $sessionId,
            'all_session_data' => $session->all()
        ]);

        $pokemonId = rand(1, 1010);

        try {
            $response = $this->httpClient->request('GET', "https://pokeapi.co/api/v2/pokemon/{$pokemonId}");
            $pokemonData = $response->toArray();
        } catch (\Exception $e) {
            $logger->error("Error fetching Pokémon: " . $e->getMessage());
            return new JsonResponse(['message' => 'Error fetching Pokémon data'], 500);
        }

        $pokemonName = ucfirst($pokemonData['name']);
        $isShiny = rand(1, $user->getShinyOdds()) === 1;
        $image = $isShiny ? $pokemonData['sprites']['front_shiny'] : $pokemonData['sprites']['front_default'];

        $encounteredPokemon = [
            'name' => $pokemonName,
            'isShiny' => $isShiny,
            'image' => $image
        ];

        // Store in session
        $session->set('encountered_pokemon', $encounteredPokemon);

        $logger->info("[Encounter] After storing Pokémon:", [
            'session_id' => $sessionId,
            'stored_pokemon' => $encounteredPokemon,
            'all_session_data' => $session->all()
        ]);

        return new JsonResponse([
            'message' => "A wild $pokemonName appeared!",
            'pokemon' => $encounteredPokemon,
            'session_id' => $sessionId  // ✅ Stuur de sessie-ID terug
        ]);
    }

    #[Route('/throw-ball', name: 'throw_ball', methods: ['POST'])]
    #[IsGranted('ROLE_USER')]
    public function throwPokeball(Request $request, EntityManagerInterface $em, SessionInterface $session, LoggerInterface $logger): JsonResponse
    {
        $user = $this->getUser();
        if (!$user instanceof User) {
            return new JsonResponse(['message' => 'Unauthorized'], 401);
        }

        $sessionIdFromHeader = $request->headers->get('X-Session-ID');
        if ($sessionIdFromHeader) {
            session_id($sessionIdFromHeader);
        }

        $logger->info("[ThrowBall] Initial session state:", [
            'session_id' => $session->getId(),
            'all_session_data' => $session->all()
        ]);

        $encounteredPokemon = $session->get('encountered_pokemon');

        if (!$encounteredPokemon) {
            return new JsonResponse(['message' => 'No Pokémon encountered!'], 400);
        }

        if ($user->getPokeballs() <= 0) {
            return new JsonResponse(['message' => 'You have no Pokéballs left!'], 400);
        }

        // ✅ Trek een Pokéball af
        $user->setPokeballs($user->getPokeballs() - 1);

        // 🎯 30% kans dat de Pokémon ontsnapt
        if (rand(1, 100) <= 30) {
            $session->remove('encountered_pokemon'); // Verwijder de Pokémon uit de sessie
            $em->flush();

            return new JsonResponse([
                'message' => "{$encounteredPokemon['name']} escaped! 😔",
                'pokemonEscaped' => true, // ⬅️ Geeft aan dat de Pokémon weg is
                'pokeballsLeft' => $user->getPokeballs()
            ], 200);
        }

        // 🎯 Als de Pokémon niet is ontsnapt, check of hij gevangen is
        $existingPokemon = $em->getRepository(Pokemon::class)->findOneBy([
            'owner' => $user,
            'name' => $encounteredPokemon['name'],
            'isShiny' => $encounteredPokemon['isShiny']
        ]);

        if ($existingPokemon) {
            $existingPokemon->setQuantity($existingPokemon->getQuantity() + 1);
        } else {
            $pokemon = new Pokemon();
            $pokemon->setName($encounteredPokemon['name']);
            $pokemon->setImage($encounteredPokemon['image']);
            $pokemon->setIsShiny($encounteredPokemon['isShiny']);
            $pokemon->setQuantity(1);
            $pokemon->setOwner($user);
            $em->persist($pokemon);
        }

        // ✅ Pokémon is gevangen! Verwijder hem uit de sessie
        $session->remove('encountered_pokemon');
        $user->setPokecoins($user->getPokecoins() + 5);

        $em->flush();

        return new JsonResponse([
            'message' => "You caught {$encounteredPokemon['name']}! 🎉",
            'pokemon' => $encounteredPokemon,
            'pokeballsLeft' => $user->getPokeballs()
        ]);
    }
}