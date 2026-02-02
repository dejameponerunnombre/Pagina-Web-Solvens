if db_id('Sistema_Solvens') is null
	create database Sistema_Solvens collate Latin1_General_CI_AS;
go

use Sistema_Solvens
go

CREATE TABLE Tipo_Usuario
(
	ID tinyint identity(1,1),
	Tipo varchar(15),
	Constraint PK_Tipo_Usuario Primary Key(ID)
);

CREATE TABLE Usuario
(
	ID tinyint identity(1,1),
	Nombre varchar(40),
	ID_Tipo_Usuario tinyint,
	Constraint PK_Usuario Primary Key(ID),
	Constraint FK_Usuario_Tipo_Usuario Foreign Key (ID_Tipo_Usuario) References Tipo_Usuario(ID)
);

CREATE TABLE Cadena
(
	ID tinyint identity(1,1),
	Nombre varchar(20),
	Constraint PK_Cadena Primary Key(ID)
);

CREATE TABLE Sucursal
(
	ID tinyint identity(1,1),
	Calle varchar(40),
	Altura int,
	Localidad varchar(40),
	Provincia varchar(40),
	Region varchar(40),
	ID_Cadena tinyint,
	Constraint PK_Sucursal Primary Key(ID),
	Constraint FK_Sucursal_Cadena Foreign Key (ID_Cadena) References Cadena(ID),
	Constraint CHK_Sucursal_Direccion CHECK (Altura > 0)
);

CREATE TABLE Producto
(
	ID tinyint identity(1,1),
	Marca varchar(20),
	Descripcion varchar(60),
	Categoría varchar(40),
	SKU varchar(80),
	Constraint PK_Producto Primary Key(ID),
);

CREATE TABLE Carga
(
	ID tinyint identity(1,1),
	Fecha date,
	Precio decimal(10,2),
	Ruta_Imagen varchar(80),
	ID_Producto tinyint,
	ID_Usuario tinyint,
	ID_Sucursal tinyint,
	Constraint PK_Carga Primary Key(ID),
	Constraint FK_Carga_Producto Foreign Key (ID_Producto) References Producto(ID),
	Constraint FK_Carga_Usuario Foreign Key (ID_Usuario) References Usuario(ID),
	Constraint FK_Carga_Sucursal Foreign Key (ID_Sucursal) References Sucursal(ID)
);

INSERT INTO Tipo_Usuario (Tipo) VALUES
('Administrador'),
('Cliente'),
('Repositor');
