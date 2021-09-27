from base64 import b64encode
encoded_credentials = b64encode(bytes(f'{"admin"}:{"nx2Tech514!"}', encoding='ascii')).decode('ascii')
print(encoded_credentials)