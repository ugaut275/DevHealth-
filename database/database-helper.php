<?php

/**
 * A helper class for interacting with the database.
 */
class DatabaseHelper {

    /** @var PDO|null The PDO database connection object. */
    public $connection;

    /**
     * Constructs a new DatabaseHelper object.
     *
     * @param array $config The database configuration parameters.
     */
    public function __construct($config) {
        $host = $config['host'] ?? '127.0.0.1';
        $port = $config['port'] ?? '3306';
        $dbname = $config['dbname'];
        $charset = $config['charset'] ?? 'utf8mb4';
        $username = $config['username'];
        $password = $config['password'];

        $dsn = "mysql:host=$host;port=$port;dbname=$dbname;charset=$charset";
        try {
            $this->connection = new PDO($dsn, $username, $password, [PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]);
        } catch (PDOException $e) {
            die($e->getMessage());
        }
    }

    /**
     * Closes the database connection.
     */
    public function close_connection() {
        $this->connection = null;
    }

    /**
     * Executes a SQL query with optional parameters.
     *
     * @param string $sql The SQL query to execute.
     * @param array $params An array of parameters to bind to the query.
     * @return PDOStatement The PDOStatement object representing the result of the query.
     */
    public function run($sql, $params = []) {
        $statement = $this->connection->prepare($sql);
        $statement->execute($params);
        return $statement;
    }
}
