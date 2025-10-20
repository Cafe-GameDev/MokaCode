#!/usr/bin/env node

// src/moka-rename.ts
import * as fs from "fs";
import * as path from "path";
var HELP_TEXT = `
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
function normalizeName(name, caseType = "nonecase") {
  let tempName = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (caseType === "nonecase") {
    return tempName.replace(/ /g, "_").replace(/[^a-zA-Z0-9_.-]/g, "");
  } else {
    const words = tempName.split(/[^a-zA-Z0-9]+/).filter((word) => word.length > 0);
    switch (caseType) {
      case "snakecase":
        return words.map((word) => word.toLowerCase()).join("_");
      case "pascalcase":
        return words.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join("");
      case "camelcase":
        return words.map((word, index) => {
          if (index === 0) {
            return word.toLowerCase();
          }
          return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        }).join("");
      case "kebabcase":
        return words.map((word) => word.toLowerCase()).join("-");
      default:
        return tempName.replace(/ /g, "_").replace(/[^a-zA-Z0-9_.-]/g, "");
    }
  }
}
function collectPaths(directory, allFiles = [], allDirs = []) {
  const entries = fs.readdirSync(directory, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.name.startsWith(".") || entry.name === "node_modules" || entry.name.toLowerCase() === "addons") {
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
function renamePath(oldPath, caseType) {
  const directory = path.dirname(oldPath);
  const oldName = path.basename(oldPath);
  const ext = path.extname(oldName);
  const baseName = oldName.substring(0, oldName.length - ext.length);
  const newBaseName = normalizeName(baseName, caseType);
  const newName = newBaseName + ext;
  const newPath = path.join(directory, newName);
  if (oldPath !== newPath) {
    try {
      fs.renameSync(oldPath, newPath);
      console.log(`Renomeado: ${oldName} -> ${newName}`);
      return newPath;
    } catch (err) {
      console.error(`Erro ao renomear ${oldPath}:`, err);
      return oldPath;
    }
  }
  return oldPath;
}
function main() {
  const args = process.argv.slice(2);
  if (args.includes("--help")) {
    console.log(HELP_TEXT);
    return;
  }
  let sourceDir = process.cwd();
  let caseType = "nonecase";
  const sourceIndex = args.indexOf("--source");
  if (sourceIndex !== -1 && args[sourceIndex + 1]) {
    sourceDir = path.resolve(args[sourceIndex + 1]);
  }
  const caseIndex = args.indexOf("--case");
  if (caseIndex !== -1 && args[caseIndex + 1]) {
    const requestedCaseType = args[caseIndex + 1].toLowerCase();
    const validCaseTypes = ["snakecase", "pascalcase", "camelcase", "kebabcase", "nonecase"];
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
  console.log(`
--- Renomeando arquivos ---`);
  allFiles.forEach((filePath) => {
    renamePath(filePath, caseType);
  });
  console.log(`
--- Renomeando diretórios ---`);
  allDirs.sort((a, b) => b.length - a.length);
  allDirs.forEach((dirPath) => {
    renamePath(dirPath, caseType);
  });
  console.log(`
Normalização concluída.`);
}
main();
