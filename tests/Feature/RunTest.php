<?php

namespace Tests\Feature;

use App\Models\Run;
use App\Models\RunLog;
use App\Models\Step;
use App\Models\User;
use App\Models\Workflow;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RunTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->actingAs(User::factory()->create());
    }

    public function test_run_workflow_creates_logs(): void
    {
        $workflow = Workflow::factory()->create();
        Step::factory()->delay()->create(['workflow_id' => $workflow->id, 'step_order' => 1]);

        $response = $this->post("/workflows/{$workflow->id}/run");

        $response->assertRedirect();
        $this->assertDatabaseHas('runs', [
            'workflow_id' => $workflow->id,
            'status' => 'succeeded',
        ]);
        $this->assertDatabaseCount('run_logs', 1);
    }

    public function test_run_logs_all_steps(): void
    {
        $workflow = Workflow::factory()->create();
        Step::factory()->delay()->create(['workflow_id' => $workflow->id, 'step_order' => 1]);
        Step::factory()->delay()->create(['workflow_id' => $workflow->id, 'step_order' => 2]);

        $this->post("/workflows/{$workflow->id}/run");

        $this->assertDatabaseCount('run_logs', 2);
    }

    public function test_failed_http_check_marks_run_as_failed(): void
    {
        \Illuminate\Support\Facades\Http::fake([
            'invalid.invalid' => \Illuminate\Support\Facades\Http::response('Not Found', 404),
        ]);

        $workflow = Workflow::factory()->create();
        Step::factory()->httpCheck(['url' => 'https://invalid.invalid'])->create([
            'workflow_id' => $workflow->id,
            'step_order' => 1,
        ]);

        $this->post("/workflows/{$workflow->id}/run");

        $this->assertDatabaseHas('runs', [
            'workflow_id' => $workflow->id,
            'status' => 'failed',
        ]);
        $this->assertDatabaseHas('run_logs', [
            'level' => 'error',
            'message' => 'HTTP check failed for https://invalid.invalid: HTTP check failed with status 404',
        ]);
    }

    public function test_503_http_check_marks_run_as_failed(): void
    {
        \Illuminate\Support\Facades\Http::fake([
            'example.com/*' => \Illuminate\Support\Facades\Http::response('Service Unavailable', 503),
        ]);

        $workflow = Workflow::factory()->create();
        Step::factory()->httpCheck(['url' => 'https://example.com/api'])->create([
            'workflow_id' => $workflow->id,
            'step_order' => 1,
        ]);

        $this->post("/workflows/{$workflow->id}/run");

        $this->assertDatabaseHas('runs', [
            'workflow_id' => $workflow->id,
            'status' => 'failed',
        ]);

        $this->assertDatabaseHas('run_logs', [
            'level' => 'error',
            'message' => 'HTTP check failed for https://example.com/api: HTTP check failed with status 503',
        ]);
    }

    public function test_can_view_run_logs(): void
    {
        $workflow = Workflow::factory()->create();
        $run = Run::factory()->create(['workflow_id' => $workflow->id]);
        RunLog::factory()->create(['run_id' => $run->id]);

        $response = $this->get("/runs/{$run->id}");

        $response->assertOk();
    }
}
