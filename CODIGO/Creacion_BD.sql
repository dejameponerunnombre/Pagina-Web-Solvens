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

CREATE TABLE Tipo_Cadena
(
	ID tinyint identity(1,1),
	Tipo varchar(30),
	Constraint PK_Tipo_Cadena Primary Key(ID)
);

CREATE TABLE Zona
(
	ID tinyint identity(1,1),
	Nombre varchar(25),
	Constraint PK_Zona Primary Key(ID),
);

CREATE TABLE Subzona
(
	ID tinyint identity(1,1),
	Nombre varchar(25),
	ID_Zona tinyint,
	Constraint PK_Subzona Primary Key(ID),
	Constraint FK_Subzona_Zona Foreign key (ID_Zona) References Zona(ID)
);

CREATE TABLE Usuario
(
	ID smallint identity(1,1),
	Nombre varchar(40),
	ID_Tipo_Usuario tinyint,
	Mail varchar(70),
	Usuario varchar(40),
	Clave varchar(40),
	Constraint PK_Usuario Primary Key(ID),
	Constraint FK_Usuario_Tipo_Usuario Foreign Key (ID_Tipo_Usuario) References Tipo_Usuario(ID)
);

CREATE TABLE Cadena
(
	ID tinyint identity(1,1),
	Nombre varchar(20),
	ID_Tipo tinyint,
	Constraint PK_Cadena Primary Key(ID),
	Constraint FK_Cadena_Tipo_Cadena Foreign key (ID_Tipo) References Tipo_Cadena(ID)
);

CREATE TABLE Sucursal
(
	ID smallint identity(1,1),
	Calle varchar(40),
	Altura int,
	Localidad varchar(40),
	ID_Subzona tinyint,
	ID_Cadena tinyint,
	Constraint PK_Sucursal Primary Key(ID),
	Constraint FK_Sucursal_Cadena Foreign Key (ID_Cadena) References Cadena(ID) ON DELETE CASCADE,
	Constraint FK_Sucursal_Subzona Foreign Key (ID_Subzona) References Subzona(ID),
	Constraint CHK_Sucursal_Direccion CHECK (Altura IS NULL OR Altura > 0)
);


CREATE TABLE Categoria
(
	ID tinyint identity(1,1),
	Categoria varchar(50),
	Constraint PK_Categoria Primary Key(ID)
);

CREATE TABLE Producto
(
	ID smallint identity(1,1),
	ID_Cliente smallint,
	Descripcion varchar(60),
	ID_Categoria tinyint,
	SKU varchar(80),
	Constraint PK_Producto Primary Key(ID),
	Constraint FK_Producto_Cliente Foreign Key (ID_Cliente) References Usuario(ID) ON DELETE CASCADE,
	Constraint FK_Producto_Categoria Foreign Key (ID_Categoria) References Categoria(ID) ON DELETE CASCADE
);

CREATE TABLE Visita
(
	ID int identity(1,1),
	Fecha date,
	ID_Repo smallint,
	ID_Cliente smallint,
	ID_Sucursal smallint,
	Constraint PK_Visita Primary Key(ID),
	Constraint FK_Visita_Usuario_Repo Foreign Key (ID_Repo) References Usuario(ID),
	Constraint FK_Visita_Usuario_Cliente Foreign Key (ID_Cliente) References Usuario(ID),
	Constraint FK_Visita_Sucursal Foreign Key (ID_Sucursal) References Sucursal(ID)
);

CREATE TABLE Carga
(
	ID tinyint identity(1,1),
	Precio decimal(10,2),
	ID_Producto smallint,
	ID_Visita int,
	Constraint PK_Carga Primary Key(ID),
	Constraint FK_Carga_Producto Foreign Key (ID_Producto) References Producto(ID),
	Constraint FK_Carga_Visita Foreign Key (ID_Visita) References Visita(ID) ON DELETE CASCADE
);

CREATE TABLE Imagen
(
	ID int identity(1,1),
	Ruta_Imagen varchar(255),
	ID_Visita int,
	Constraint PK_Imagen Primary Key(ID),
	Constraint FK_Imagen_Visita Foreign Key (ID_Visita) References Visita(ID) ON DELETE CASCADE
);

CREATE TABLE Abastece
(
	ID smallint identity(1,1),
	ID_Cliente smallint,
	ID_Sucursal smallint,
	Constraint PK_Abastece Primary Key(ID),
	Constraint FK_Abastece_Cliente Foreign Key (ID_Cliente) References Usuario(ID) ON DELETE CASCADE,
	Constraint FK_Abastece_Sucursal Foreign Key (ID_Sucursal) References Sucursal(ID) ON DELETE CASCADE
);
