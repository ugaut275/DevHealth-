<?
$hash = password_hash("pw", PASSWORD_BCRYPT, ['cost' => 12]);
$hash2 = password_hash("jpratt", PASSWORD_BCRYPT, ['cost' => 12]);

echo $hash;
echo "  ";
echo $hash2;
