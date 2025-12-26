<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title', 'Workflow Runner')</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body {
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            min-height: 100vh;
            color: #e4e4e4;
        }

        .navbar {
            background: rgba(26, 26, 46, 0.95) !important;
            backdrop-filter: blur(10px);
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .card {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 16px;
        }

        .card-header {
            background: rgba(255, 255, 255, 0.05);
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .btn-primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none;
            border-radius: 8px;
        }

        .btn-primary:hover {
            background: linear-gradient(135deg, #5a6fd6 0%, #6a4190 100%);
            transform: translateY(-1px);
        }

        .btn-success {
            background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
            border: none;
        }

        .btn-danger {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            border: none;
        }

        .table {
            color: #e4e4e4;
        }

        .table th {
            border-color: rgba(255, 255, 255, 0.1);
        }

        .table td {
            border-color: rgba(255, 255, 255, 0.05);
        }

        .form-control,
        .form-select {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.2);
            color: #e4e4e4;
            border-radius: 8px;
        }

        .form-control:focus,
        .form-select:focus {
            background: rgba(255, 255, 255, 0.1);
            border-color: #667eea;
            color: #e4e4e4;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.25);
        }

        .form-control::placeholder {
            color: rgba(255, 255, 255, 0.4);
        }

        .badge-info {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .badge-success {
            background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
        }

        .badge-danger {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        }

        .badge-warning {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        }

        .step-card {
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            transition: all 0.2s ease;
        }

        .step-card:hover {
            background: rgba(255, 255, 255, 0.06);
            transform: translateX(4px);
        }

        .log-entry {
            background: rgba(0, 0, 0, 0.2);
            border-radius: 8px;
            font-family: 'Monaco', 'Consolas', monospace;
            font-size: 0.9rem;
        }

        .log-info {
            border-left: 3px solid #38ef7d;
        }

        .log-warn {
            border-left: 3px solid #f5a623;
        }

        .log-error {
            border-left: 3px solid #f5576c;
        }

        .alert-success {
            background: rgba(17, 153, 142, 0.2);
            border: 1px solid rgba(56, 239, 125, 0.3);
            color: #38ef7d;
        }

        a {
            color: #667eea;
        }

        a:hover {
            color: #764ba2;
        }
    </style>
</head>

<body>
    <nav class="navbar navbar-expand-lg navbar-dark mb-4">
        <div class="container">
            <a class="navbar-brand fw-bold" href="{{ route('workflows.index') }}">
                🔄 Workflow Runner
            </a>
            <div class="d-flex align-items-center">
                @auth
                <span class="text-muted me-3">{{ Auth::user()->name }}</span>
                <form action="{{ route('logout') }}" method="POST" class="d-inline">
                    @csrf
                    <button type="submit" class="btn btn-sm btn-outline-light">Logout</button>
                </form>
                @endauth
            </div>
        </div>
    </nav>

    <div class="container pb-5">
        @if(session('success'))
        <div class="alert alert-success alert-dismissible fade show" role="alert">
            {{ session('success') }}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
        @endif

        @if($errors->any())
        <div class="alert alert-danger">
            <ul class="mb-0">
                @foreach($errors->all() as $error)
                <li>{{ $error }}</li>
                @endforeach
            </ul>
        </div>
        @endif

        @yield('content')
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
</body>

</html>