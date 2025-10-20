#!/usr/bin/env node
import * as fs from 'fs';
import * as path from 'path';

const HELP_TEXT: string = `
☕ Uso: moka-rename --source <caminho> --case <tipo-de-case>

   Dê uma "mexida" nos nomes dos seus arquivos e pastas! Este comando normaliza
   recursivamente os nomes, deixando tudo padronizado e com aroma de código limpo.
   É como organizar sua prateleira de grãos: tudo no lugar certo para um café perfeito.

As seguintes transformações são aplicadas:
- Substitui espaços por underscores (_).
- Remove acentos (ex: 'caminhão' -> 'caminhao').
- Remove caracteres especiais, mantendo apenas letras, números, underscores (_), hífens (-) e pontos (.).
- Aplica o tipo de case especificado.

Opções:
  --source <caminho>     O "moedor" de onde os arquivos serão renomeados.
                         O padrão é o diretório de trabalho atual.
  --case <tipo-de-case>  Define o tipo de case para os nomes.
                         Valores possíveis: snake_case, PascalCase, camelCase, kebab-case, nonecase.
                         O padrão é 'nonecase'.
  --help                 Mostra este "cardápio" de ajuda.
`;

function normalizeName(name: string, caseType: string = 'nonecase'): string {
    // Remove accents and normalize to NFD
    let tempName = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    if (caseType === 'nonecase') {
        // For nonecase, replace spaces with underscores and remove other special chars
        return tempName.replace(/ /g, '_').replace(/[^a-zA-Z0-9_.-]/g, '');
    } else {
        // For other cases, split by non-alphanumeric characters (including spaces, hyphens, underscores, dots)
        // and filter out empty strings
        const words = tempName.split(/[^a-zA-Z0-9]+/).filter(word => word.length > 0);

        switch (caseType) {
            case 'snakecase':
                return words.map(word => word.toLowerCase()).join('_');
            case 'pascalcase':
                return words.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join('');
            case 'camelcase':
                return words.map((word, index) => {
                    if (index === 0) {
                        return word.toLowerCase();
                    }
                    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
                }).join('');
            case 'kebabcase':
                return words.map(word => word.toLowerCase()).join('-');
            default:
                // This case should ideally not be reached if 'nonecase' is handled above
                // but as a fallback, return the original 'nonecase' logic
                return tempName.replace(/ /g, '_').replace(/[^a-zA-Z0-9_.-]/g, '');
        }
    }
}

interface CollectedPaths {
    allFiles: string[];
    allDirs: string[];
}

function collectPaths(directory: string, allFiles: string[] = [], allDirs: string[] = []): CollectedPaths {
    const entries = fs.readdirSync(directory, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(directory, entry.name);

        if (entry.name.startsWith('.') || entry.name === 'node_modules' || entry.name.toLowerCase() === 'addons') {
            console.log(`Ignorando: ${fullPath}`);
            continue;
        }

        if (entry.isDirectory()) {
            allDirs.push(fullPath);
            collectPaths(fullPath, allFiles, allDirs);
        } else {
            allFiles.push(fullPath);
        }
    }
    return { allFiles, allDirs };
}

function renamePath(oldPath: string, caseType: string): string {
    const directory: string = path.dirname(oldPath);
    const oldName: string = path.basename(oldPath);

    // Separar nome base e extensão
    const ext: string = path.extname(oldName);
    const baseName: string = oldName.substring(0, oldName.length - ext.length);

    const newBaseName: string = normalizeName(baseName, caseType);
    const newName: string = newBaseName + ext; // Adicionar a extensão de volta

    const newPath: string = path.join(directory, newName);

    if (oldPath !== newPath) {
        try {
            fs.renameSync(oldPath, newPath);
            console.log(`Renomeado: ${oldName} -> ${newName}`);
            return newPath;
        } catch (err: any) {
            console.error(`Erro ao renomear ${oldPath}:`, err);
            return oldPath;
        }
    }
    return oldPath;
}

function main(): void {
    const args: string[] = process.argv.slice(2);

    if (args.includes('--help')) {
        console.log(HELP_TEXT);
        return;
    }

    let sourceDir: string = process.cwd();
    let caseType: string = 'nonecase';

    const sourceIndex: number = args.indexOf('--source');
    if (sourceIndex !== -1 && args[sourceIndex + 1]) {
        sourceDir = path.resolve(args[sourceIndex + 1]);
    }

    const caseIndex: number = args.indexOf('--case');
    if (caseIndex !== -1 && args[caseIndex + 1]) {
        const requestedCaseType = args[caseIndex + 1].toLowerCase();
        const validCaseTypes = ['snakecase', 'pascalcase', 'camelcase', 'kebabcase', 'nonecase'];
        if (validCaseTypes.includes(requestedCaseType)) {
            caseType = requestedCaseType;
        } else {
            console.warn(`Aviso: Tipo de case inválido: ${requestedCaseType}. Usando 'nonecase' como padrão.`);
        }
    }

    if (!fs.existsSync(sourceDir)) {
        console.error(`Erro: O diretório de origem não existe: ${sourceDir}`);
        return;
    }

    console.log(`Iniciando normalização em: ${sourceDir} com case: ${caseType}`);

    let { allFiles, allDirs } = collectPaths(sourceDir);

    console.log('\n--- Renomeando arquivos ---');
    allFiles.forEach(filePath => {
        renamePath(filePath, caseType);
    });

    console.log('\n--- Renomeando diretórios ---');
    allDirs.sort((a, b) => b.length - a.length);
    allDirs.forEach(dirPath => {
        renamePath(dirPath, caseType);
    });

    console.log('\nNormalização concluída.');
}

main();