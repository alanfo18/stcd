CREATE TABLE `agendamentos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`diaristaId` int NOT NULL,
	`especialidadeId` int NOT NULL,
	`nomeCliente` varchar(255) NOT NULL,
	`telefoneCliente` varchar(20),
	`enderecoServico` text NOT NULL,
	`dataServico` timestamp NOT NULL,
	`horaInicio` varchar(5),
	`horaFim` varchar(5),
	`descricaoServico` text,
	`status` enum('agendado','concluido','cancelado') NOT NULL DEFAULT 'agendado',
	`valorServico` int,
	`observacoes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `agendamentos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `avaliacoes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`diaristaId` int NOT NULL,
	`agendamentoId` int NOT NULL,
	`nota` int NOT NULL,
	`comentario` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `avaliacoes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `diaristas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`nome` varchar(255) NOT NULL,
	`telefone` varchar(20) NOT NULL,
	`email` varchar(320),
	`endereco` text,
	`cidade` varchar(100),
	`cep` varchar(10),
	`valorDiaria` int NOT NULL,
	`ativa` boolean NOT NULL DEFAULT true,
	`dataContratacao` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `diaristas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `diaristas_especialidades` (
	`id` int AUTO_INCREMENT NOT NULL,
	`diaristaId` int NOT NULL,
	`especialidadeId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `diaristas_especialidades_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `especialidades` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(100) NOT NULL,
	`descricao` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `especialidades_id` PRIMARY KEY(`id`),
	CONSTRAINT `especialidades_nome_unique` UNIQUE(`nome`)
);
--> statement-breakpoint
CREATE TABLE `pagamentos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`diaristaId` int NOT NULL,
	`agendamentoId` int,
	`valor` int NOT NULL,
	`dataPagamento` timestamp NOT NULL,
	`metodo` enum('dinheiro','pix','transferencia','cartao') NOT NULL,
	`status` enum('pendente','pago','cancelado') NOT NULL DEFAULT 'pendente',
	`descricao` text,
	`comprovante` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pagamentos_id` PRIMARY KEY(`id`)
);
