<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Stock Meuve API</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
        }
        .float-animation {
            animation: float 6s ease-in-out infinite;
        }
        .gradient-bg {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .card-hover {
            transition: all 0.3s ease;
        }
        .card-hover:hover {
            transform: translateY(-5px);
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        .endpoint-card {
            transition: all 0.3s ease;
            border-left: 4px solid transparent;
        }
        .endpoint-card:hover {
            border-left-color: #667eea;
            background: #f8f9ff;
        }
        .method-badge {
            font-size: 0.75rem;
            font-weight: 600;
            padding: 0.25rem 0.5rem;
            border-radius: 0.25rem;
            text-transform: uppercase;
        }
        .method-get { background: #10b981; color: white; }
        .method-post { background: #3b82f6; color: white; }
        .method-put { background: #f59e0b; color: white; }
        .method-delete { background: #ef4444; color: white; }
    </style>
</head>
<body class="bg-gray-50">
    <!-- Navigation -->
    <nav class="bg-white shadow-lg sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between h-16">
                <div class="flex items-center">
                    <i class="fas fa-warehouse text-2xl text-indigo-600 mr-3"></i>
                    <h1 class="text-xl font-bold text-gray-800">Stock Meuve API</h1>
                </div>
                <div class="flex items-center space-x-4">
                    <a href="/docs/api" class="text-gray-600 hover:text-indigo-600 transition">
                        <i class="fas fa-book mr-2"></i>API Docs
                    </a>
                    <button onclick="toggleTheme()" class="text-gray-600 hover:text-indigo-600 transition">
                        <i class="fas fa-moon" id="themeIcon"></i>
                    </button>
                </div>
            </div>
        </div>
    </nav>

    <!-- Hero Section -->
    <section class="gradient-bg text-white py-20">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div class="float-animation mb-8">
                <i class="fas fa-chart-line text-6xl mb-6"></i>
            </div>
            <h1 class="text-5xl font-bold mb-6">Stock Meuve API</h1>
            <p class="text-xl mb-8 max-w-3xl mx-auto">
                A modern Laravel-based inventory management system for multi-shop stock tracking and real-time reporting
            </p>
            <div class="flex justify-center space-x-4">
                <button onclick="scrollToSection('endpoints')" class="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
                    <i class="fas fa-code mr-2"></i>Explore API
                </button>
                <a href="/docs/api" class="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-indigo-600 transition">
                    <i class="fas fa-book mr-2"></i>Full Documentation
                </a>
            </div>
        </div>
    </section>

    <!-- Features Section -->
    <section class="py-16">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 class="text-3xl font-bold text-center mb-12 text-gray-800">Key Features</h2>
            <div class="grid md:grid-cols-3 gap-8">
                <div class="card-hover bg-white p-6 rounded-xl shadow-lg">
                    <div class="text-indigo-600 text-3xl mb-4">
                        <i class="fas fa-store"></i>
                    </div>
                    <h3 class="text-xl font-semibold mb-2">Multi-Shop Support</h3>
                    <p class="text-gray-600">Manage inventory across multiple locations with real-time synchronization</p>
                </div>
                <div class="card-hover bg-white p-6 rounded-xl shadow-lg">
                    <div class="text-indigo-600 text-3xl mb-4">
                        <i class="fas fa-exchange-alt"></i>
                    </div>
                    <h3 class="text-xl font-semibold mb-2">Movement Tracking</h3>
                    <p class="text-gray-600">Track all stock movements including receipts, distributions, and corrections</p>
                </div>
                <div class="card-hover bg-white p-6 rounded-xl shadow-lg">
                    <div class="text-indigo-600 text-3xl mb-4">
                        <i class="fas fa-chart-bar"></i>
                    </div>
                    <h3 class="text-xl font-semibold mb-2">Advanced Analytics</h3>
                    <p class="text-gray-600">Comprehensive reporting and analytics with data export capabilities</p>
                </div>
            </div>
        </div>
    </section>

    <!-- API Endpoints Section -->
    <section id="endpoints" class="py-16 bg-gray-100">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 class="text-3xl font-bold text-center mb-12 text-gray-800">API Endpoints</h2>
            
            <!-- Authentication -->
            <div class="mb-8">
                <h3 class="text-xl font-semibold mb-4 text-gray-700">
                    <i class="fas fa-key mr-2"></i>Authentication
                </h3>
                <div class="space-y-3">
                    <div class="endpoint-card bg-white p-4 rounded-lg shadow">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center space-x-3">
                                <span class="method-badge method-post">POST</span>
                                <code class="text-sm bg-gray-100 px-2 py-1 rounded">/api/auth/login</code>
                            </div>
                            <span class="text-gray-600">User authentication</span>
                        </div>
                    </div>
                    <div class="endpoint-card bg-white p-4 rounded-lg shadow">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center space-x-3">
                                <span class="method-badge method-post">POST</span>
                                <code class="text-sm bg-gray-100 px-2 py-1 rounded">/api/auth/register</code>
                            </div>
                            <span class="text-gray-600">User registration</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Products -->
            <div class="mb-8">
                <h3 class="text-xl font-semibold mb-4 text-gray-700">
                    <i class="fas fa-box mr-2"></i>Products
                </h3>
                <div class="space-y-3">
                    <div class="endpoint-card bg-white p-4 rounded-lg shadow">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center space-x-3">
                                <span class="method-badge method-get">GET</span>
                                <code class="text-sm bg-gray-100 px-2 py-1 rounded">/api/products</code>
                            </div>
                            <span class="text-gray-600">List all products</span>
                        </div>
                    </div>
                    <div class="endpoint-card bg-white p-4 rounded-lg shadow">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center space-x-3">
                                <span class="method-badge method-post">POST</span>
                                <code class="text-sm bg-gray-100 px-2 py-1 rounded">/api/products</code>
                            </div>
                            <span class="text-gray-600">Create new product</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Shops -->
            <div class="mb-8">
                <h3 class="text-xl font-semibold mb-4 text-gray-700">
                    <i class="fas fa-store-alt mr-2"></i>Shops
                </h3>
                <div class="space-y-3">
                    <div class="endpoint-card bg-white p-4 rounded-lg shadow">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center space-x-3">
                                <span class="method-badge method-get">GET</span>
                                <code class="text-sm bg-gray-100 px-2 py-1 rounded">/api/shops</code>
                            </div>
                            <span class="text-gray-600">List all shops</span>
                        </div>
                    </div>
                    <div class="endpoint-card bg-white p-4 rounded-lg shadow">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center space-x-3">
                                <span class="method-badge method-post">POST</span>
                                <code class="text-sm bg-gray-100 px-2 py-1 rounded">/api/shops</code>
                            </div>
                            <span class="text-gray-600">Create new shop</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Movements -->
            <div class="mb-8">
                <h3 class="text-xl font-semibold mb-4 text-gray-700">
                    <i class="fas fa-exchange-alt mr-2"></i>Stock Movements
                </h3>
                <div class="space-y-3">
                    <div class="endpoint-card bg-white p-4 rounded-lg shadow">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center space-x-3">
                                <span class="method-badge method-get">GET</span>
                                <code class="text-sm bg-gray-100 px-2 py-1 rounded">/api/movements</code>
                            </div>
                            <span class="text-gray-600">List all movements</span>
                        </div>
                    </div>
                    <div class="endpoint-card bg-white p-4 rounded-lg shadow">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center space-x-3">
                                <span class="method-badge method-post">POST</span>
                                <code class="text-sm bg-gray-100 px-2 py-1 rounded">/api/movements/receipt</code>
                            </div>
                            <span class="text-gray-600">Record stock receipt</span>
                        </div>
                    </div>
                    <div class="endpoint-card bg-white p-4 rounded-lg shadow">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center space-x-3">
                                <span class="method-badge method-post">POST</span>
                                <code class="text-sm bg-gray-100 px-2 py-1 rounded">/api/movements/distribution</code>
                            </div>
                            <span class="text-gray-600">Transfer stock between shops</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Reports -->
            <div class="mb-8">
                <h3 class="text-xl font-semibold mb-4 text-gray-700">
                    <i class="fas fa-chart-line mr-2"></i>Reports
                </h3>
                <div class="space-y-3">
                    <div class="endpoint-card bg-white p-4 rounded-lg shadow">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center space-x-3">
                                <span class="method-badge method-get">GET</span>
                                <code class="text-sm bg-gray-100 px-2 py-1 rounded">/api/reports/summary</code>
                            </div>
                            <span class="text-gray-600">Summary report</span>
                        </div>
                    </div>
                    <div class="endpoint-card bg-white p-4 rounded-lg shadow">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center space-x-3">
                                <span class="method-badge method-get">GET</span>
                                <code class="text-sm bg-gray-100 px-2 py-1 rounded">/api/reports/by-shop</code>
                            </div>
                            <span class="text-gray-600">Shop-wise report</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- API Testing Section -->
    <section class="py-16">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 class="text-3xl font-bold text-center mb-12 text-gray-800">API Testing Console</h2>
            
            <div class="bg-white rounded-xl shadow-lg p-8">
                <!-- Request Configuration -->
                <div class="grid md:grid-cols-3 gap-4 mb-6">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">HTTP Method</label>
                        <select id="methodSelect" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                            <option value="GET">GET</option>
                            <option value="POST">POST</option>
                            <option value="PUT">PUT</option>
                            <option value="DELETE">DELETE</option>
                        </select>
                    </div>
                    <div class="md:col-span-2">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Endpoint</label>
                        <input type="text" id="endpointInput" placeholder="/api/products" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                    </div>
                </div>

                <!-- Quick Templates -->
                <div class="mb-6">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Quick Templates</label>
                    <div class="flex flex-wrap gap-2">
                        <button onclick="loadTemplate('GET', '/api/products')" class="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm transition">List Products</button>
                        <button onclick="loadTemplate('GET', '/api/shops')" class="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm transition">List Shops</button>
                        <button onclick="loadTemplate('GET', '/api/movements')" class="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm transition">List Movements</button>
                        <button onclick="loadTemplate('POST', '/api/auth/login')" class="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm transition">Login</button>
                        <button onclick="loadTemplate('POST', '/api/products')" class="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm transition">Create Product</button>
                        <button onclick="loadTemplate('GET', '/api/reports/summary')" class="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm transition">Summary Report</button>
                    </div>
                </div>

                <!-- Headers -->
                <div class="mb-6">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Headers</label>
                    <div class="space-y-2" id="headersContainer">
                        <div class="flex gap-2">
                            <input type="text" placeholder="Header Name" class="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" data-header-name>
                            <input type="text" placeholder="Header Value" class="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" data-header-value>
                            <button onclick="removeHeader(this)" class="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg text-sm transition">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    <button onclick="addHeader()" class="mt-2 px-3 py-1 bg-indigo-100 hover:bg-indigo-200 text-indigo-600 rounded text-sm transition">
                        <i class="fas fa-plus mr-1"></i>Add Header
                    </button>
                </div>

                <!-- Request Body -->
                <div class="mb-6" id="requestBodySection">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Request Body (JSON)</label>
                    <textarea id="requestBody" rows="6" placeholder='{"name": "Product Name", "description": "Description", "sku": "SKU123", "price": 99.99}' class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm"></textarea>
                </div>

                <!-- Auth Token -->
                <div class="mb-6">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Auth Token (if required)</label>
                    <div class="flex gap-2">
                        <input type="password" id="authToken" placeholder="Bearer token..." class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                        <button onclick="setSampleToken()" class="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition">Use Sample Token</button>
                    </div>
                </div>

                <!-- Send Request -->
                <div class="flex items-center gap-4 mb-6">
                    <button onclick="sendRequest()" class="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition">
                        <i class="fas fa-paper-plane mr-2"></i>Send Request
                    </button>
                    <button onclick="clearResponse()" class="px-6 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition">
                        <i class="fas fa-eraser mr-2"></i>Clear Response
                    </button>
                    <div id="loadingIndicator" class="hidden">
                        <i class="fas fa-spinner fa-spin text-indigo-600"></i> Sending...
                    </div>
                </div>

                <!-- Response -->
                <div id="responseSection" class="hidden">
                    <div class="border-t pt-6">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="text-lg font-semibold">Response</h3>
                            <div class="flex items-center gap-4">
                                <span id="responseStatus" class="px-3 py-1 rounded-full text-sm font-medium"></span>
                                <span id="responseTime" class="text-sm text-gray-600"></span>
                            </div>
                        </div>
                        
                        <!-- Response Headers -->
                        <div class="mb-4">
                            <h4 class="text-sm font-medium text-gray-700 mb-2">Response Headers</h4>
                            <div id="responseHeaders" class="bg-gray-50 p-3 rounded-lg text-sm font-mono"></div>
                        </div>

                        <!-- Response Body -->
                        <div>
                            <h4 class="text-sm font-medium text-gray-700 mb-2">Response Body</h4>
                            <div class="relative">
                                <button onclick="copyResponse()" class="absolute top-2 right-2 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm transition">
                                    <i class="fas fa-copy mr-1"></i>Copy
                                </button>
                                <pre id="responseContent" class="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm"></pre>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Saved Requests -->
            <div class="mt-8 bg-white rounded-xl shadow-lg p-8">
                <h3 class="text-xl font-semibold mb-4">Saved Requests</h3>
                <div id="savedRequests" class="space-y-2">
                    <p class="text-gray-500 text-sm">No saved requests yet. Make a request and save it for later.</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="bg-gray-800 text-white py-8">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center">
                <p class="mb-2">Built with ❤️ using Laravel</p>
                <div class="flex justify-center space-x-4">
                <a href="/docs/api" class="hover:text-indigo-400 transition">
                    <i class="fas fa-book mr-2"></i>Documentation
                </a>
                <a href="https://github.com" class="hover:text-indigo-400 transition">
                    <i class="fab fa-github mr-2"></i>GitHub
                </a>
            </div>
            </div>
        </div>
    </footer>

    <script>
        // Theme toggle
        function toggleTheme() {
            document.body.classList.toggle('dark');
            const icon = document.getElementById('themeIcon');
            icon.classList.toggle('fa-moon');
            icon.classList.toggle('fa-sun');
        }

        // Smooth scroll
        function scrollToSection(sectionId) {
            document.getElementById(sectionId).scrollIntoView({ behavior: 'smooth' });
        }

        // API Testing Functions
        let savedRequests = JSON.parse(localStorage.getItem('savedRequests') || '[]');

        // Load template
        function loadTemplate(method, endpoint, body = '') {
            document.getElementById('methodSelect').value = method;
            document.getElementById('endpointInput').value = endpoint;
            
            // Set sample body for POST/PUT requests
            if (method === 'POST' || method === 'PUT') {
                if (endpoint.includes('/auth/login')) {
                    document.getElementById('requestBody').value = JSON.stringify({
                        "login": "test@example.com",
                        "password": "password"
                    }, null, 2);
                } else if (endpoint.includes('/products')) {
                    document.getElementById('requestBody').value = JSON.stringify({
                        "name": "Sample Product",
                        "description": "Product description",
                        "sku": "SKU" + Math.floor(Math.random() * 1000),
                        "price": 99.99
                    }, null, 2);
                } else if (endpoint.includes('/shops')) {
                    document.getElementById('requestBody').value = JSON.stringify({
                        "name": "Sample Shop",
                        "address": "123 Main St",
                        "phone": "+1234567890"
                    }, null, 2);
                }
            } else {
                document.getElementById('requestBody').value = '';
            }
        }

        // Add header row
        function addHeader() {
            const container = document.getElementById('headersContainer');
            const headerRow = document.createElement('div');
            headerRow.className = 'flex gap-2';
            headerRow.innerHTML = `
                <input type="text" placeholder="Header Name" class="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" data-header-name>
                <input type="text" placeholder="Header Value" class="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" data-header-value>
                <button onclick="removeHeader(this)" class="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg text-sm transition">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            container.appendChild(headerRow);
        }

        // Remove header row
        function removeHeader(button) {
            button.parentElement.remove();
        }

        // Set sample token
        function setSampleToken() {
            document.getElementById('authToken').value = '1|sample_token_here';
        }

        // Get headers from form
        function getHeaders() {
            const headers = {};
            const authToken = document.getElementById('authToken').value;
            
            if (authToken) {
                headers['Authorization'] = authToken.startsWith('Bearer ') ? authToken : `Bearer ${authToken}`;
            }
            
            headers['Content-Type'] = 'application/json';
            headers['Accept'] = 'application/json';
            
            // Add custom headers
            document.querySelectorAll('#headersContainer > div').forEach(row => {
                const name = row.querySelector('[data-header-name]').value;
                const value = row.querySelector('[data-header-value]').value;
                if (name && value) {
                    headers[name] = value;
                }
            });
            
            return headers;
        }

        // Send API request
        async function sendRequest() {
            const method = document.getElementById('methodSelect').value;
            const endpoint = document.getElementById('endpointInput').value;
            const requestBody = document.getElementById('requestBody').value;
            
            if (!endpoint) {
                alert('Please enter an endpoint');
                return;
            }
            
            const loadingIndicator = document.getElementById('loadingIndicator');
            const responseSection = document.getElementById('responseSection');
            const responseContent = document.getElementById('responseContent');
            const responseStatus = document.getElementById('responseStatus');
            const responseTime = document.getElementById('responseTime');
            const responseHeaders = document.getElementById('responseHeaders');
            
            loadingIndicator.classList.remove('hidden');
            responseSection.classList.add('hidden');
            
            const startTime = Date.now();
            
            try {
                const options = {
                    method: method,
                    headers: getHeaders()
                };
                
                if (method !== 'GET' && requestBody) {
                    options.body = requestBody;
                }
                
                const response = await fetch(endpoint, options);
                const endTime = Date.now();
                const responseTimeMs = endTime - startTime;
                
                // Get response headers
                const headers = {};
                response.headers.forEach((value, key) => {
                    headers[key] = value;
                });
                
                // Get response body
                let responseData;
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    responseData = await response.json();
                } else {
                    responseData = await response.text();
                }
                
                // Display response
                responseContent.textContent = typeof responseData === 'object' 
                    ? JSON.stringify(responseData, null, 2)
                    : responseData;
                
                responseStatus.textContent = `${response.status} ${response.statusText}`;
                responseStatus.className = `px-3 py-1 rounded-full text-sm font-medium ${
                    response.ok 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                }`;
                
                responseTime.textContent = `${responseTimeMs}ms`;
                responseHeaders.textContent = JSON.stringify(headers, null, 2);
                
                responseSection.classList.remove('hidden');
                
                // Save request
                saveRequest(method, endpoint, requestBody, response.ok);
                
            } catch (error) {
                responseContent.textContent = 'Error: ' + error.message;
                responseStatus.textContent = 'ERROR';
                responseStatus.className = 'px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800';
                responseTime.textContent = '';
                responseHeaders.textContent = '';
                responseSection.classList.remove('hidden');
            } finally {
                loadingIndicator.classList.add('hidden');
            }
        }

        // Save request to localStorage
        function saveRequest(method, endpoint, body, success) {
            const request = {
                id: Date.now(),
                method,
                endpoint,
                body,
                success,
                timestamp: new Date().toISOString()
            };
            
            savedRequests.unshift(request);
            if (savedRequests.length > 10) savedRequests.pop(); // Keep only last 10
            
            localStorage.setItem('savedRequests', JSON.stringify(savedRequests));
            displaySavedRequests();
        }

        // Display saved requests
        function displaySavedRequests() {
            const container = document.getElementById('savedRequests');
            
            if (savedRequests.length === 0) {
                container.innerHTML = '<p class="text-gray-500 text-sm">No saved requests yet. Make a request and save it for later.</p>';
                return;
            }
            
            container.innerHTML = savedRequests.map(req => `
                <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                    <div class="flex items-center gap-3">
                        <span class="method-badge method-${req.method.toLowerCase()}">${req.method}</span>
                        <code class="text-sm">${req.endpoint}</code>
                        <span class="text-xs text-gray-500">${new Date(req.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="text-xs px-2 py-1 rounded ${req.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                            ${req.ok ? 'Success' : 'Error'}
                        </span>
                        <button onclick="loadSavedRequest('${req.id}')" class="text-indigo-600 hover:text-indigo-800 text-sm">
                            <i class="fas fa-redo"></i>
                        </button>
                        <button onclick="deleteSavedRequest('${req.id}')" class="text-red-600 hover:text-red-800 text-sm">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `).join('');
        }

        // Load saved request
        function loadSavedRequest(id) {
            const request = savedRequests.find(req => req.id == id);
            if (request) {
                loadTemplate(request.method, request.endpoint, request.body);
            }
        }

        // Delete saved request
        function deleteSavedRequest(id) {
            savedRequests = savedRequests.filter(req => req.id != id);
            localStorage.setItem('savedRequests', JSON.stringify(savedRequests));
            displaySavedRequests();
        }

        // Clear response
        function clearResponse() {
            document.getElementById('responseSection').classList.add('hidden');
        }

        // Copy response to clipboard
        function copyResponse() {
            const content = document.getElementById('responseContent').textContent;
            navigator.clipboard.writeText(content).then(() => {
                const button = event.target.closest('button');
                const originalText = button.innerHTML;
                button.innerHTML = '<i class="fas fa-check mr-1"></i>Copied!';
                setTimeout(() => {
                    button.innerHTML = originalText;
                }, 2000);
            });
        }

        // Toggle request body visibility based on method
        document.getElementById('methodSelect').addEventListener('change', function() {
            const method = this.value;
            const requestBodySection = document.getElementById('requestBodySection');
            
            if (method === 'GET') {
                requestBodySection.style.display = 'none';
            } else {
                requestBodySection.style.display = 'block';
            }
        });

        // Initialize
        displaySavedRequests();

        // Add some interactivity
        document.addEventListener('DOMContentLoaded', function() {
            // Animate cards on scroll
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }
                });
            });

            document.querySelectorAll('.card-hover').forEach(card => {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                card.style.transition = 'all 0.6s ease';
                observer.observe(card);
            });
        });
    </script>
</body>
</html>
