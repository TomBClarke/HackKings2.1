<?php
require_once "Pusher.php";
$APP_KEY="9d3ca23fe4e0cd26c73c";
$APP_SECRET="a304bd1f3602a0f0feb1";
$APP_ID="160597";
$pusher = new Pusher($APP_KEY, $APP_SECRET, $APP_ID);
echo $pusher->socket_auth($_POST['channel_name'], $_POST['socket_id']);