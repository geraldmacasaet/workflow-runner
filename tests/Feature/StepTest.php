<?php

namespace Tests\Feature;

use App\Models\Step;
use App\Models\User;
use App\Models\Workflow;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StepTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->actingAs(User::factory()->create());
    }

    public function test_can_add_step_to_workflow(): void
    {
        $workflow = Workflow::factory()->create();
        $response = $this->post("/workflows/{$workflow->id}/steps", [
            'type' => 'delay',
            'config' => ['seconds' => 1],
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('steps', ['workflow_id' => $workflow->id, 'type' => 'delay']);
    }

    public function test_step_config_is_validated(): void
    {
        $workflow = Workflow::factory()->create();
        $response = $this->post("/workflows/{$workflow->id}/steps", [
            'type' => 'http_check',
            'config' => [], // Missing url
        ]);

        $response->assertSessionHasErrors('config.url');
    }

    public function test_can_reorder_steps(): void
    {
        $workflow = Workflow::factory()->create();
        $step1 = Step::factory()->create(['workflow_id' => $workflow->id, 'step_order' => 1]);
        $step2 = Step::factory()->create(['workflow_id' => $workflow->id, 'step_order' => 2]);

        $this->post("/steps/{$step2->id}/move-up");

        $this->assertEquals(1, $step2->fresh()->step_order);
        $this->assertEquals(2, $step1->fresh()->step_order);
    }
}
