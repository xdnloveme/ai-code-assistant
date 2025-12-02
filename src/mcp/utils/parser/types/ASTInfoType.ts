import ts from "typescript";

export interface Location {
	start: ts.LineAndCharacter;
	end: ts.LineAndCharacter;
}

export interface ASTParseResult {
	functions: FunctionInfo[];
	classes: ClassInfo[];
	imports: ImportInfo[];
	exports: ExportInfo[];
}

export interface FunctionInfo {
	name: string;
	parameters: ParameterInfo[];
	returnType: string;
	isAsync: boolean;
	isExported: boolean;
	location: Location;
}

export interface ParameterInfo {
	name: string;
	type: string;
	optional: boolean;
}

export interface ClassInfo {
	name: string;
	methods: MethodInfo[];
	properties: PropertyInfo[];
	isExported: boolean;
	isAbstract: boolean;
	location: Location;
}

export interface MethodInfo {
	name: string;
	parameters: ParameterInfo[];
	returnType: string;
	isAsync: boolean;
	isStatic: boolean;
	isAbstract: boolean;
}

export interface PropertyInfo {
	name: string;
	type: string;
	isOptional: boolean;
	isStatic: boolean;
}

export interface ImportInfo {
	moduleName: string;
	namedImports: string[];
	defaultImport: string | null;
	isTypeOnly: boolean;
}

export interface ExportInfo {
	name: string;
	isTypeOnly: boolean;
	isDefault: boolean;
	kind: "function" | "class" | "variable" | "type";
}
