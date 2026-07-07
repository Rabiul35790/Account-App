<?php

namespace App\Http\Middleware;

use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        try {
            $settings = Setting::first();
        } catch (\Exception) {
            $settings = null;
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
            ],
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
            ],
            'settings' => $settings ? [
                'company_name' => $settings->company_name,
                'phone' => $settings->phone,
                'primary_color' => $settings->primary_color ?? '#6366f1',
                'logo_url' => $settings->logo_url,
            ] : [
                'company_name' => null,
                'phone' => null,
                'primary_color' => '#6366f1',
                'logo_url' => null,
            ],
        ];
    }
}
