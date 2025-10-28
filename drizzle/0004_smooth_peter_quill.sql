CREATE TABLE `logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`userName` varchar(255) NOT NULL,
	`userEmail` varchar(320) NOT NULL,
	`acao` varchar(100) NOT NULL,
	`tabela` varchar(100) NOT NULL,
	`registroId` int,
	`descricao` text,
	`dadosAntigos` text,
	`dadosNovos` text,
	`ipAddress` varchar(45),
	`userAgent` text,
	`status` enum('sucesso','erro') NOT NULL DEFAULT 'sucesso',
	`mensagemErro` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notificacoes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`tipo` enum('diarista_cadastrada','agendamento_criado','pagamento_registrado','recibo_emitido','acesso_suspeito') NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`descricao` text,
	`icone` varchar(50),
	`cor` varchar(20),
	`lido` boolean NOT NULL DEFAULT false,
	`whatsappEnviado` boolean NOT NULL DEFAULT false,
	`registroId` int,
	`tabelaRelacionada` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notificacoes_id` PRIMARY KEY(`id`)
);
