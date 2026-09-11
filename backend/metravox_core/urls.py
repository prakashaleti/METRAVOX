"""
URL configuration for METRAVOX.
Serves the REST API and the React Single Page Application.
"""

from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import TemplateView
from django.conf import settings
from django.conf.urls.static import static
from django.http import HttpResponse

def frontend_view(request):
    index_file = settings.FRONTEND_DIST / 'index.html'
    if index_file.exists():
        with open(index_file, 'r', encoding='utf-8') as f:
            response = HttpResponse(f.read())
            response['Cache-Control'] = 'no-cache, no-store, must-revalidate'
            response['Pragma'] = 'no-cache'
            response['Expires'] = '0'
            return response
    return HttpResponse(
        "<h1>METRAVOX API Running</h1>"
        "<p>Frontend build not yet located in frontend/dist. Run 'npm run build' inside the frontend directory.</p>"
    )

from django.views.static import serve

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/', include('api.urls')),
    re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
    
    # Catch-all route to serve React frontend SPA
    re_path(r'^(?!api/|admin/|assets/|media/).*$', frontend_view, name='frontend-spa'),
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.FRONTEND_DIST / 'assets')
