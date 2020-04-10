@extends('layouts.app')

@section('content')
<div class="container">
  <x-space></x-space>
  <div class="row justify-content-center">
    <div class="col-md-12">
      <div class="card">
        <div class="card-header">Space</div>
        <div class="card-body">
          <table class="table table-bordered table-striped">
            <thead>
              <tr>
                <th>Nama Tempat</th>
                <th>Alamat</th>
                <th>Latitude</th>
                <th>Longitude</th>
              </tr>
            </thead>
            <tbody>
              @foreach ($spaces as $space)
              <tr>
                <td>{{ $space->title }}</td>
                <td>{{ $space->address }}</td>
                <td>{{ $space->latitude }}</td>
                <td>{{ $space->longitude }}</td>
              </tr>
              @endforeach
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</div>
@endsection
