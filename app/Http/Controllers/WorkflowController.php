<?php

namespace App\Http\Controllers;

use App\Models\Workflow;
use App\Services\WorkflowRunnerService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WorkflowController extends Controller
{
    /**
     * Display a listing of workflows.
     */
    public function index()
    {
        $workflows = Workflow::withCount('steps', 'runs')->latest()->get();

        return Inertia::render('Workflows/Index', [
            'workflows' => $workflows,
        ]);
    }

    /**
     * Show the form for creating a new workflow.
     */
    public function create()
    {
        return Inertia::render('Workflows/Create');
    }

    /**
     * Store a newly created workflow.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $workflow = Workflow::create($validated);

        return redirect()->route('workflows.show', $workflow)
            ->with('success', 'Workflow created successfully.');
    }

    /**
     * Display the specified workflow.
     */
    public function show(Workflow $workflow)
    {
        $workflow->load(['steps' => fn($q) => $q->orderBy('step_order'), 'runs' => fn($q) => $q->latest()->take(10)]);

        return Inertia::render('Workflows/Show', [
            'workflow' => $workflow,
        ]);
    }

    /**
     * Show the form for editing the specified workflow.
     */
    public function edit(Workflow $workflow)
    {
        return Inertia::render('Workflows/Edit', [
            'workflow' => $workflow,
        ]);
    }

    /**
     * Update the specified workflow.
     */
    public function update(Request $request, Workflow $workflow)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $workflow->update($validated);

        return redirect()->route('workflows.show', $workflow)
            ->with('success', 'Workflow updated successfully.');
    }

    /**
     * Remove the specified workflow.
     */
    public function destroy(Workflow $workflow)
    {
        $workflow->delete();

        return redirect()->route('workflows.index')
            ->with('success', 'Workflow deleted successfully.');
    }

    /**
     * Run the specified workflow.
     */
    public function run(Workflow $workflow, WorkflowRunnerService $service)
    {
        $run = $service->execute($workflow);

        return back()->with([
            'success' => "Workflow executed with status: {$run->status}",
            'runId' => $run->id,
        ]);
    }

    /**
     * Get workflow steps as JSON.
     */
    public function steps(Workflow $workflow)
    {
        return response()->json($workflow->steps()->orderBy('step_order')->get());
    }
}
