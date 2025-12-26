<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return to_route('workflows.index');
    })->name('dashboard');

    // Workflow routes
    Route::resource('workflows', \App\Http\Controllers\WorkflowController::class);
    Route::post('workflows/{workflow}/run', [\App\Http\Controllers\WorkflowController::class, 'run'])->name('workflows.run');
    Route::get('workflows/{workflow}/steps-json', [\App\Http\Controllers\WorkflowController::class, 'steps'])->name('workflows.steps-json');

    // Step routes
    Route::post('workflows/{workflow}/steps', [\App\Http\Controllers\StepController::class, 'store'])->name('steps.store');
    Route::post('workflows/{workflow}/steps/reorder', [\App\Http\Controllers\StepController::class, 'reorder'])->name('steps.reorder');
    Route::delete('steps/{step}', [\App\Http\Controllers\StepController::class, 'destroy'])->name('steps.destroy');
    Route::post('steps/{step}/move-up', [\App\Http\Controllers\StepController::class, 'moveUp'])->name('steps.moveUp');
    Route::post('steps/{step}/move-down', [\App\Http\Controllers\StepController::class, 'moveDown'])->name('steps.moveDown');

    // Run routes
    Route::get('runs/{run}', [\App\Http\Controllers\RunController::class, 'show'])->name('runs.show');
});

require __DIR__ . '/settings.php';
