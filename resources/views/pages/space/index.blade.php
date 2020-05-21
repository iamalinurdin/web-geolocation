@extends('layouts.app')

@section('content')
<div class="container">
  <x-space></x-space>
  <div class="row justify-content-center">
    <div class="col-md-8">
      @foreach ($spaces as $space)
      <div class="card my-2">
        <div class="card-body">
          <h5 class="card-title">
            {{ $space->title }}
            @if ($space->user_id == Auth::user()->id)
            <form action="{{ route('space.destroy', $space->id) }}" method="post">
              @csrf @method('DELETE')
              <button type="submit" class="btn btn-sm btn-danger float-right mx-1" onclick="return confirm('kamu yakin?')">Delete</button>
              <a href="{{ route('space.edit', $space->id) }}" class="btn btn-sm btn-secondary float-right mx-1">Edit</a>
            </form>
            @endif
          </h5>
          <h6 class="card-subtitle">{{ $space->address }}</h6>
          <p class="card-text">{{ $space->description }}</p>
          <a href="#" onclick="openDirection({{ $space->latitude }}, {{ $space->longitude }}, {{ $space->id }})" class="card-link">Direction</a>
        </div>
      </div>
      @endforeach
    </div>
  </div>
</div>
@endsection
