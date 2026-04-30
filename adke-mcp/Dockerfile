# Stage 1: Build
FROM python:3.12-slim AS builder
WORKDIR /app

COPY requirements.txt .
# Install to a local folder to make copying easier
RUN pip install --no-cache-dir --user -r requirements.txt

# Stage 2: Runtime
FROM python:3.12-slim
WORKDIR /app

# Copy only the installed packages from builder
COPY --from=builder /root/.local /root/.local
# Copy your code, but NOT the volume-mapped version
COPY . .

# Ensure the installed packages are in the PATH
ENV PATH=/root/.local/bin:$PATH
# Keep Python from writing .pyc files
ENV PYTHONDONTWRITEBYTECODE=1

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]