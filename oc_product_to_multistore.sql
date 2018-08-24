-- phpMyAdmin SQL Dump
-- version 4.8.2
-- https://www.phpmyadmin.net/
--
-- Хост: 127.0.0.1
-- Время создания: Авг 20 2018 г., 10:14
-- Версия сервера: 10.1.34-MariaDB
-- Версия PHP: 7.2.7

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- База данных: `shop`
--

-- --------------------------------------------------------

--
-- Структура таблицы `oc_product_to_multistore`
--

CREATE TABLE `oc_product_to_multistore` (
  `product_id` int(11) NOT NULL,
  `store_id` int(11) NOT NULL DEFAULT '0',
  `price` int(11) DEFAULT NULL,
  `quantity` int(11) DEFAULT NULL,
  `date_added` datetime NOT NULL,
  `date_modified` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='костыль для мультимагазина';

--
-- Дамп данных таблицы `oc_product_to_multistore`
--

INSERT INTO `oc_product_to_multistore` (`product_id`, `store_id`, `price`, `quantity`, `date_added`, `date_modified`) VALUES
(30, 0, 47, 60, '2018-08-19 00:00:59', '2018-08-19 00:21:35'),
(30, 1, 96, 70, '2018-08-19 00:00:59', '2018-08-19 00:21:35'),
(50, 0, 26, 15, '2018-08-19 15:50:36', '2018-08-19 15:51:06'),
(50, 1, 89, 54, '2018-08-19 15:50:36', '2018-08-19 15:51:06');

--
-- Индексы сохранённых таблиц
--

--
-- Индексы таблицы `oc_product_to_multistore`
--
ALTER TABLE `oc_product_to_multistore`
  ADD PRIMARY KEY (`product_id`,`store_id`),
  ADD KEY `store_id` (`store_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
