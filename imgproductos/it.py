import os

def renombrar_archivos():
    # Obtiene la lista de archivos omitiendo carpetas
    archivos = [f for f in os.listdir('.') if os.path.isfile(f) and f.endswith(('.png', '.jpg', '.jpeg'))]
    archivos.sort() # Los ordena para mantener cierta secuencia

    for i, nombre_viejo in enumerate(archivos, start=1):
        extension = os.path.splitext(nombre_viejo)[1]
        nuevo_nombre = f"creativo_{i}{extension}"
        
        # Evita renombrar el propio script
        if nombre_viejo != __file__:
            os.rename(nombre_viejo, nuevo_nombre)
            print(f"Renombrado: {nombre_viejo} -> {nuevo_nombre}")

if __name__ == "__main__":
    renombrar_archivos()