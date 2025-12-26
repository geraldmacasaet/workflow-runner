<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('run_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('run_id')->constrained()->cascadeOnDelete();
            $table->foreignId('step_id')->nullable()->constrained()->nullOnDelete();
            $table->enum('level', ['info', 'warn', 'error']);
            $table->text('message');
            $table->timestamp('logged_at');

            $table->index(['run_id', 'logged_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('run_logs');
    }
};
