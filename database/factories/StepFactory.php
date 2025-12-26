<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Step>
 */
class StepFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'workflow_id' => \App\Models\Workflow::factory(),
            'type' => 'delay',
            'config' => ['seconds' => 1],
            'step_order' => 1,
        ];
    }

    public function delay(array $config = []): static
    {
        return $this->state(fn() => [
            'type' => 'delay',
            'config' => array_merge(['seconds' => fake()->numberBetween(1, 2)], $config),
        ]);
    }

    public function httpCheck(array $config = []): static
    {
        return $this->state(fn() => [
            'type' => 'http_check',
            'config' => array_merge(['url' => fake()->url()], $config),
        ]);
    }
}
