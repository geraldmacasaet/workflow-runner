<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RunLog extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = ['run_id', 'step_id', 'level', 'message', 'logged_at'];

    protected $casts = [
        'logged_at' => 'datetime',
    ];

    public function run()
    {
        return $this->belongsTo(Run::class);
    }

    public function step()
    {
        return $this->belongsTo(Step::class);
    }
}
