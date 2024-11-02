import math

def encontrar_numeros_cubicos(inicio, cantidad):
    numeros_cubicos = []
    numero = inicio

    while len(numeros_cubicos) < cantidad:
        numero += 1
        raiz_cubica = numero ** (1 / 3)
        if int(raiz_cubica) == raiz_cubica:
            numeros_cubicos.append(numero)
            print(f"Raíz cúbica exacta encontrada: {numero} -> {int(raiz_cubica)}")

    return numeros_cubicos

def multiplicar_numeros(numeros):
    resultado = 1
    for numero in numeros:
        resultado *= numero
    return resultado

def escribir_resultados_en_archivo(numeros, archivo):
    with open(archivo, 'w') as f:
        for numero in numeros:
            raiz_cubica = int(numero ** (1 / 3))
            f.write(f"Número: {numero}, Raíz cúbica: {raiz_cubica}, Decimal: {numero}, Octal: {oct(numero)}, Hexadecimal: {hex(numero)}, Binario: {bin(numero)}\n")

def main():
    inicio = 6245
    cantidad = 80

    numeros_cubicos = encontrar_numeros_cubicos(inicio, cantidad)

    resultado_multiplicacion = multiplicar_numeros(numeros_cubicos)
    print(f"Resultado de la multiplicación de todos los números: {resultado_multiplicacion}")
    print(f"Decimal: {resultado_multiplicacion}")
    print(f"Octal: {oct(resultado_multiplicacion)}")
    print(f"Hexadecimal: {hex(resultado_multiplicacion)}")
    print(f"Binario: {bin(resultado_multiplicacion)}")

    escribir_resultados_en_archivo(numeros_cubicos, 'resultados.txt')

if __name__ == "__main__":
    main()