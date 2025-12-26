<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class WorkflowSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $workflow = \App\Models\Workflow::create([
            'name' => 'Example Workflow',
            'description' => 'A sample workflow with delay and HTTP check steps',
        ]);

        \App\Models\Step::create([
            'workflow_id' => $workflow->id,
            'type' => 'delay',
            'config' => ['seconds' => 1],
            'step_order' => 1,
        ]);

        \App\Models\Step::create([
            'workflow_id' => $workflow->id,
            'type' => 'http_check',
            'config' => ['url' => 'https://example.com'],
            'step_order' => 2,
        ]);

        \App\Models\Step::create([
            'workflow_id' => $workflow->id,
            'type' => 'delay',
            'config' => ['seconds' => 2],
            'step_order' => 3,
        ]);
    }
}
