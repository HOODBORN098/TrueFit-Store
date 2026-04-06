import os
from django.core.wsgi import get_wsgi_application

# Revert to standard WSGI application and setup.
# Migrations are now handled in products/apps.py's ready() method.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'truefit_backend.settings')

application = get_wsgi_application()
