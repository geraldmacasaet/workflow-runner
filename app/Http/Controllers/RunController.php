<?php

namespace App\Http\Controllers;

use App\Models\Run;
use Inertia\Inertia;

class RunController extends Controller
{
    /**
     * Display the specified run with its logs.
     */
    public function show(Run $run)
    {
        $run->load(['workflow', 'logs' => fn($q) => $q->with('step')->orderBy('logged_at')]);

        return Inertia::render('Runs/Show', [
            'run' => $run,
        ]);
    }
}
