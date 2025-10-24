CREATE TABLE `comprovantes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`pagamentoId` int NOT NULL,
	`url` varchar(500) NOT NULL,
	`tipoArquivo` varchar(50) NOT NULL,
	`nomeArquivo` varchar(255) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `comprovantes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notificacoes_whatsapp` (
	`id` int AUTO_INCREMENT NOT NULL,
	`agendamentoId` int,
	`pagamentoId` int,
	`diaristaId` int,
	`telefone` varchar(20) NOT NULL,
	`tipo` enum('agendamento','pagamento','recibo','aviso') NOT NULL,
	`mensagem` text NOT NULL,
	`status` enum('pendente','enviado','falha') NOT NULL DEFAULT 'pendente',
	`dataEnvio` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notificacoes_whatsapp_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `recibos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`agendamentoId` int NOT NULL,
	`pagamentoId` int NOT NULL,
	`diaristaId` int NOT NULL,
	`urlPdf` varchar(500) NOT NULL,
	`assinado` boolean NOT NULL DEFAULT false,
	`dataAssinatura` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `recibos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `agendamentos` ADD `horaDescansoInicio` varchar(5);--> statement-breakpoint
ALTER TABLE `agendamentos` ADD `horaDescansoFim` varchar(5);