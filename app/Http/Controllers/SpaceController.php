<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Space;
use Storage;

class SpaceController extends Controller
{
    public function __construct()
    {
        $this->middleware(['auth']);
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return view('pages.space.index', [
            'spaces' => Space::all(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        return view('pages.space.create');
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $space = $request->user()->spaces()->create($request->except('photo'));
        $photos = [];
        foreach ($request->file('photo') as $photo) {
            $path = Storage::disk('public')->putFile('spaces', $photo);
            $photos[] = [
                'space_id' => $space->id,
                'path' => $path,
            ];
        }

        $space->photos()->insert($photos);

        return redirect()->route('space.index')->withSuccess('Alamat baru berhasil ditambahkan');
    }

    public function browse()
    {
        return view('pages.space.browse');
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show(Request $request, $id)
    {
        $space = Space::findOrFail($id);
        return view('pages.space.show', compact('space'));
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit(Request $request, $id)
    {
        $space = Space::findOrFail($id);
        if ($space->user_id != $request->user()->id) {
            return redirect()->route('home');
        }

        return view('pages.space.edit', [
            'space' => $space,
        ]);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $space = Space::findOrFail($id);
        $space->update($request->all());
        return redirect()->route('home');
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy(Request $request, $id)
    {
        $space = Space::findOrFail($id);
        if ($space->user_id != $request->user()->id) {
            return redirect()->route('home');
        }

        foreach($space->photos as $photo) {
            Storage::delete('public/'.$photo->path);
        }

        $space->delete();
        return redirect()->route('home');
    }
}
