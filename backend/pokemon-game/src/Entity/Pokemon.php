<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use App\Entity\User;

#[ORM\Entity]
#[ORM\Table(name: 'pokemon')]
class Pokemon
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private ?int $id = null;

    #[ORM\Column(type: 'string')]
    private string $name;

    #[ORM\Column(type: 'string')]
    private string $image;

    #[ORM\Column(type: 'boolean')]
    private bool $isShiny = false;

    #[ORM\Column(type: 'integer', options: ["default" => 1])]
    private int $quantity = 1; // Count of how many times a Pokémon is caught

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: false)]
    private User $owner;

    public function getId(): ?int { return $this->id; }

    public function getName(): string { return $this->name; }

    public function setName(string $name): self
    {
        $this->name = $name;
        return $this;
    }

    public function getImage(): string { return $this->image; }

    public function setImage(string $image): self
    {
        $this->image = $image;
        return $this;
    }

    public function getIsShiny(): bool { return $this->isShiny; }

    public function setIsShiny(bool $isShiny): self
    {
        $this->isShiny = $isShiny;
        return $this;
    }

    public function getQuantity(): int { return $this->quantity; }

    public function setQuantity(int $quantity): self
    {
        $this->quantity = $quantity;
        return $this;
    }

    public function getOwner(): User { return $this->owner; }

    public function setOwner(User $owner): self
    {
        $this->owner = $owner;
        return $this;
    }
}
