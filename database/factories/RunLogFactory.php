<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\RunLog>
 */
class RunLogFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'run_id' => \App\Models\Run::factory(),
            'step_id' => null,
            'level' => fake()->randomElement(['info', 'warn', 'error']),
            'message' => fake()->sentence(),
            'logged_at' => now(),
        ];
    }
}
