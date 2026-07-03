# TechDocs generator image with the mkdocs-techdocs-frontmatter plugin
# preinstalled.
#
# By default this image is built on top of `python:3.14-slim` and installs
# `mkdocs-techdocs-core` alongside the frontmatter plugin, so it can be used
# directly with the TechDocs CLI:
#
#   docker build -t techdocs-frontmatter:local mkdocs-extension
#   npx @techdocs/cli generate --docker-image techdocs-frontmatter:local --no-pull
#
# Override the base image with any Python 3.14+ / TechDocs-compatible image:
#
#   docker build \
#     --build-arg BASE_IMAGE=my-org/techdocs:latest \
#     -t techdocs-frontmatter:local \
#     mkdocs-extension

ARG BASE_IMAGE=python:3.14-slim
FROM ${BASE_IMAGE}

# graphviz + plantuml deps commonly required by mkdocs-techdocs-core plugins.
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        git \
        graphviz \
        openjdk-17-jre-headless \
        plantuml \
    && rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir mkdocs-techdocs-core

COPY . /tmp/mkdocs-techdocs-frontmatter
RUN pip install --no-cache-dir /tmp/mkdocs-techdocs-frontmatter

WORKDIR /content
ENTRYPOINT ["mkdocs"]
