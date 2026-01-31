CREATE TABLE Invoices (
    InvoiceID INT PRIMARY KEY,
    CustomerName VARCHAR(100)
);

CREATE TABLE InvoiceItems (
    ItemID INT PRIMARY KEY,
    InvoiceID INT,
    Name VARCHAR(100),
    Price DECIMAL(10,2),
    FOREIGN KEY (InvoiceID) REFERENCES Invoices(InvoiceID)
);

INSERT INTO Invoices (InvoiceID, CustomerName) VALUES
(2, 'Alice Smith'),
(3, 'Bob Johnson'),
(4, 'Emma Wilson');

INSERT INTO InvoiceItems (ItemID, InvoiceID, Name, Price) VALUES
-- Invoice 1 (John Doe)
(2, 1, 'Widget B', 29.99),
(3, 1, 'Widget C', 9.99),

-- Invoice 2 (Alice Smith)
(4, 2, 'Gadget A', 49.99),
(5, 2, 'Gadget B', 15.50),

-- Invoice 3 (Bob Johnson)
(6, 3, 'Tool A', 99.00),

-- Invoice 4 (Emma Wilson)
(7, 4, 'Accessory A', 5.99),
(8, 4, 'Accessory B', 12.49),
(9, 4, 'Accessory C', 7.75);
