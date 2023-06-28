FROM python:3.11

# set working directory
WORKDIR /app

# add and install requirements
COPY ai-chat-backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# add app
COPY ai-chat-backend/ .

EXPOSE 8000

# OSS Remove libdb5.3
RUN dpkg -r --force-all libdb5.3

# run server
CMD ["uvicorn", "main:ai_chat_backend", "--host", "0.0.0.0", "--port", "8000"]
