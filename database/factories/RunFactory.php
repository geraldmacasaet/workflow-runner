<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Run>
 */
class RunFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $started = fake()->dateTimeBetween('-1 week', 'now');

        return [
            'workflow_id' => \App\Models\Workflow::factory(),
            'status' => fake()->randomElement(['running', 'succeeded', 'failed']),
            'started_at' => $started,
            'finished_at' => fake()->optional()->dateTimeBetween($started, 'now'),
        ];
    }
}
