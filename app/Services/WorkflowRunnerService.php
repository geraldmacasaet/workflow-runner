<?php

namespace App\Services;

use App\Models\Run;
use App\Models\RunLog;
use App\Models\Step;
use App\Models\Workflow;
use Exception;
use Illuminate\Support\Facades\Http;

class WorkflowRunnerService
{
    /**
     * Execute a workflow and return the run instance.
     */
    public function execute(Workflow $workflow): Run
    {
        $run = Run::create([
            'workflow_id' => $workflow->id,
            'status' => 'running',
            'started_at' => now(),
        ]);

        try {
            foreach ($workflow->steps()->orderBy('step_order')->get() as $step) {
                $this->executeStep($step, $run);
            }

            $run->update([
                'status' => 'succeeded',
                'finished_at' => now(),
            ]);
        } catch (Exception $e) {
            $this->log($run, null, 'error', $e->getMessage());
            $run->update([
                'status' => 'failed',
                'finished_at' => now(),
            ]);
        }

        return $run;
    }

    /**
     * Execute a single step based on its type.
     */
    protected function executeStep(Step $step, Run $run): void
    {
        match ($step->type) {
            'delay' => $this->handleDelay($step, $run),
            'http_check' => $this->handleHttpCheck($step, $run),
            default => throw new Exception("Unknown step type: {$step->type}"),
        };
    }

    /**
     * Handle delay step type.
     */
    protected function handleDelay(Step $step, Run $run): void
    {
        $seconds = min($step->config['seconds'] ?? 1, 2); // Cap at 2 seconds
        sleep($seconds);
        $this->log($run, $step, 'info', "Delayed for {$seconds} second(s)");
    }

    /**
     * Handle HTTP check step type.
     */
    protected function handleHttpCheck(Step $step, Run $run): void
    {
        $url = $step->config['url'] ?? '';

        if (empty($url)) {
            throw new Exception('URL is required for http_check step');
        }

        try {
            $response = Http::timeout(2)->get($url);
            $statusCode = $response->status();

            if (!$response->successful()) {
                throw new Exception("HTTP check failed with status {$statusCode}");
            }

            $this->log($run, $step, 'info', "HTTP {$statusCode} from {$url}");
        } catch (Exception $e) {
            throw new Exception("HTTP check failed for {$url}: " . $e->getMessage());
        }
    }

    /**
     * Log a message for a run.
     */
    protected function log(Run $run, ?Step $step, string $level, string $message): void
    {
        RunLog::create([
            'run_id' => $run->id,
            'step_id' => $step?->id,
            'level' => $level,
            'message' => $message,
            'logged_at' => now(),
        ]);
    }
}
