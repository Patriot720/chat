<?php
include 'VKRequest.php';
include 'ChromePhp.php';
require ('VK.php');
if (isset($_POST['q']) && isset($_COOKIE['token'])) {
    $q = $_POST['q'];   
    $api_key = $_COOKIE['token'];
    $app_id = '6126872';
    $api_secret = '45c3b4a345c3b4a345c3b4a3a4459ec9bb445c345c3b4a31cbb32bc94921c1bc9187ccd';
    $req = new VKRequest($api_key);
    $vk = new VK\VK($app_id, $api_secret, $api_key);
    echo json_encode(vkReq($vk,$_POST));
}
else {
    echo 'no_api';
}
function vkReq(VK\VK $vk,$post){
    $method = $post['q'];
    $data = $post;
    
    unset($data['q']);
    
    $response = $vk->api($method,$data);
    if(isset($response['error'])){
        $error = json_encode($response);
        throw new Exception($error);
    }
    return $response['response'];
}
