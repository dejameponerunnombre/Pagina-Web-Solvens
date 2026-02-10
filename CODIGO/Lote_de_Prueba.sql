use Sistema_Solvens
go


INSERT INTO Tipo_Usuario (Tipo) VALUES
('Administrador'),
('Cliente'),
('Repositor');



INSERT INTO Usuario (Nombre, ID_Tipo_Usuario, Mail, Usuario, Clave)
VALUES 
('Alejandro García', 1, 'admin@empresa.com', 'admin_ale', 'Pass1234!'),
('Marta Rodríguez', 2, 'marta.editor@mail.com', 'marta_edit', 'Marta.2026'),
('Carlos Sánchez', 3, 'carlos.invitado@gmail.com', 'carlitos_99', 'invitado123'),
('Lucía Fernández', 2, 'lfer@outlook.com', 'lucia_pro', 'L_fernandez88'),
('Roberto Gómez', 1, 'rgomez.ti@empresa.com', 'rob_admin', 'TI_root_44'),
('Sofía López', 3, 'sofia.user@web.com', 'sofi_user', 'user_pass_26'),
('Elena Martínez', 2, 'elena.m@freelance.com', 'elena_m', 'Elenita.sql'),
('Javier Ruiz', 3, 'jruiz@servicios.com', 'javi_vips', 'javi.9988');