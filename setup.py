from setuptools import setup, find_packages

setup(name = "django-wysiwyg-forms",
      version = "0.1.1",
      description = "A What You See Is What You Get form editor for Django.",
      author = "Nick Fitzgerald",
      author_email = "fitzgen@gmail.com",
      url = "https://github.com/fitzgen/django-wysiwyg-forms",
      packages = find_packages(),
      include_package_data = True,
      zip_safe = False,
      install_requires = ['django==1.3'],
      )
