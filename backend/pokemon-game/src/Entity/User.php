<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;

#[ORM\Entity]
#[ORM\Table(name: 'users')]
class User implements UserInterface, PasswordAuthenticatedUserInterface
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private ?int $id = null;

    #[ORM\Column(type: 'string', unique: true)]
    private ?string $username = null;

    #[ORM\Column(type: 'string')]
    private ?string $password = null;

    #[ORM\Column(type: 'integer', options: ["default" => 4096])]
    private int $shinyOdds = 4096;

    #[ORM\Column(type: 'integer', options: ["default" => 10])]
    private int $pokeballs = 10;

    #[ORM\Column(type: 'integer', options: ["default" => 0])]
    private int $pokecoins = 0;

    public function getId(): ?int { return $this->id; }

    public function getUsername(): ?string { return $this->username; }

    public function setUsername(string $username): self
    {
        $this->username = $username;
        return $this;
    }

    public function getPassword(): ?string { return $this->password; }

    public function setPassword(string $password): self
    {
        $this->password = $password;
        return $this;
    }

    public function getShinyOdds(): int { return $this->shinyOdds; }

    public function setShinyOdds(int $shinyOdds): self
    {
        $this->shinyOdds = $shinyOdds;
        return $this;
    }

    public function getPokeballs(): int { return $this->pokeballs; }

    public function setPokeballs(int $pokeballs): self
    {
        $this->pokeballs = $pokeballs;
        return $this;
    }

    public function getPokecoins(): int { return $this->pokecoins; }

    public function setPokecoins(int $pokecoins): self
    {
        $this->pokecoins = $pokecoins;
        return $this;
    }

    public function getRoles(): array { return ['ROLE_USER']; }

    public function eraseCredentials(): void {}

    public function getUserIdentifier(): string
    {
        return $this->username;
    }
}
