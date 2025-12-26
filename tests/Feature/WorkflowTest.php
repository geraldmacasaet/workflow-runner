<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Workflow;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WorkflowTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->actingAs(User::factory()->create());
    }

    public function test_can_create_workflow(): void
    {
        $response = $this->post('/workflows', [
            'name' => 'Test Workflow',
            'description' => 'A test workflow',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('workflows', ['name' => 'Test Workflow']);
    }

    public function test_workflow_name_is_required(): void
    {
        $response = $this->post('/workflows', ['name' => '']);
        $response->assertSessionHasErrors('name');
    }

    public function test_can_update_workflow(): void
    {
        $workflow = Workflow::factory()->create();
        $this->put("/workflows/{$workflow->id}", [
            'name' => 'Updated Name',
            'description' => 'Updated description',
        ]);
        $this->assertDatabaseHas('workflows', ['name' => 'Updated Name']);
    }

    public function test_can_delete_workflow(): void
    {
        $workflow = Workflow::factory()->create();
        $this->delete("/workflows/{$workflow->id}");
        $this->assertDatabaseMissing('workflows', ['id' => $workflow->id]);
    }
}
