<?php

namespace App\Http\Controllers;

use App\Models\Step;
use App\Models\Workflow;
use Illuminate\Http\Request;

class StepController extends Controller
{
    /**
     * Store a new step for a workflow.
     */
    public function store(Request $request, Workflow $workflow)
    {
        $validated = $request->validate([
            'type' => 'required|in:delay,http_check',
            'config' => 'required|array',
            'config.seconds' => 'required_if:type,delay|integer|min:1|max:2',
            'config.url' => 'required_if:type,http_check|url',
        ]);

        // Get the next step order
        $nextOrder = $workflow->steps()->max('step_order') + 1;

        $workflow->steps()->create([
            'type' => $validated['type'],
            'config' => $validated['config'],
            'step_order' => $nextOrder,
        ]);

        return redirect()->route('workflows.show', $workflow)
            ->with('success', 'Step added successfully.');
    }

    /**
     * Remove a step.
     */
    public function destroy(Step $step)
    {
        $workflowId = $step->workflow_id;
        $step->delete();

        // Reorder remaining steps
        Step::where('workflow_id', $workflowId)
            ->orderBy('step_order')
            ->get()
            ->each(fn($s, $index) => $s->update(['step_order' => $index + 1]));

        return redirect()->route('workflows.show', $workflowId)
            ->with('success', 'Step deleted successfully.');
    }

    /**
     * Move a step up in order.
     */
    public function moveUp(Step $step)
    {
        $previousStep = Step::where('workflow_id', $step->workflow_id)
            ->where('step_order', '<', $step->step_order)
            ->orderByDesc('step_order')
            ->first();

        if ($previousStep) {
            $tempOrder = $step->step_order;
            $step->update(['step_order' => $previousStep->step_order]);
            $previousStep->update(['step_order' => $tempOrder]);
        }

        return redirect()->route('workflows.show', $step->workflow_id)
            ->with('success', 'Step moved up.');
    }

    /**
     * Move a step down in order.
     */
    public function moveDown(Step $step)
    {
        $nextStep = Step::where('workflow_id', $step->workflow_id)
            ->where('step_order', '>', $step->step_order)
            ->orderBy('step_order')
            ->first();

        if ($nextStep) {
            $tempOrder = $step->step_order;
            $step->update(['step_order' => $nextStep->step_order]);
            $nextStep->update(['step_order' => $tempOrder]);
        }

        return redirect()->route('workflows.show', $step->workflow_id)
            ->with('success', 'Step moved down.');
    }

    /**
     * Reorder steps based on drag-and-drop.
     */
    public function reorder(Request $request, Workflow $workflow)
    {
        $validated = $request->validate([
            'steps' => 'required|array',
            'steps.*' => 'integer|exists:steps,id',
        ]);

        foreach ($validated['steps'] as $index => $stepId) {
            Step::where('id', $stepId)
                ->where('workflow_id', $workflow->id)
                ->update(['step_order' => $index + 1]);
        }

        return redirect()->route('workflows.show', $workflow)
            ->with('success', 'Steps reordered successfully.');
    }
}
