<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE budgets MODIFY COLUMN period ENUM('monthly', 'quarterly', 'half_yearly', 'yearly') NOT NULL DEFAULT 'monthly'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE budgets MODIFY COLUMN period ENUM('monthly', 'quarterly', 'yearly') NOT NULL DEFAULT 'monthly'");
    }
};
