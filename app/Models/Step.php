<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Step extends Model
{
    use HasFactory;

    protected $fillable = ['workflow_id', 'type', 'config', 'step_order'];

    protected $casts = [
        'config' => 'array',
    ];

    public function workflow()
    {
        return $this->belongsTo(Workflow::class);
    }
}
