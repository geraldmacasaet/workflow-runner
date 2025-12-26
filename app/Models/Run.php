<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Run extends Model
{
    use HasFactory;

    protected $fillable = ['workflow_id', 'status', 'started_at', 'finished_at'];

    protected $casts = [
        'started_at' => 'datetime',
        'finished_at' => 'datetime',
    ];

    public function workflow()
    {
        return $this->belongsTo(Workflow::class);
    }

    public function logs()
    {
        return $this->hasMany(RunLog::class);
    }
}
