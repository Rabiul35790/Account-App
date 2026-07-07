<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class SettingsController extends Controller
{
    public function edit()
    {
        try {
            $settings = Setting::first();
        } catch (\Exception) {
            $settings = null;
        }

        return Inertia::render('Settings/Index', [
            'settings' => [
                'company_name' => $settings?->company_name,
                'phone' => $settings?->phone,
                'primary_color' => $settings?->primary_color ?? '#6366f1',
                'logo_url' => $settings?->logo_url,
            ],
        ]);
    }

    public function logo()
    {
        try {
            $settings = Setting::first();
        } catch (\Exception) {
            $settings = null;
        }

        return response()->json([
            'logo_url' => $settings?->logo_url,
        ]);
    }

    public function update(Request $request)
    {
        try {
            $settings = Setting::first() ?? Setting::create([]);
        } catch (\Exception) {
            $settings = Setting::create([]);
        }

        $data = $request->validate([
            'company_name' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:255',
            'primary_color' => 'nullable|string|max:7',
            'logo' => 'nullable|image|mimes:png,jpg,jpeg,svg|max:2048',
        ]);

        if ($request->hasFile('logo')) {
            if ($settings->logo_path) {
                Storage::delete($settings->logo_path);
            }
            $data['logo_path'] = $request->file('logo')->store('logos', 'public');
        }

        $settings->update($data);

        return redirect()->back()->with('success', 'Settings updated successfully.');
    }
}
