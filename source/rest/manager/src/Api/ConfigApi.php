<?php

namespace OpenAPIServer\Api;
use OpenAPIServer\Helper;
use Psr\Container\ContainerInterface;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Exception;

class ConfigApi extends AbstractConfigApi
{
    protected $configFile;
    protected $apiConfig;
    protected $hidden;
    protected $escapeChars = "'";

    public function __construct(ContainerInterface $container = null)
    {
        parent::__construct($container);
        $this->apiConfig = include getcwd() . "/src/config.php";
        $this->configFile = realpath(
            $this->apiConfig->configDir . "/hidden.php"
        );
        $this->load();
    }

    protected function load()
    {
        $hidden = [];
        include $this->configFile;
        $this->hidden = $hidden;
    }

    protected function dump()
    {
        $out =
            '<?php
// File for configurations that shouldn\'t be shared with the user
$data = \'' .
            json_encode($this->hidden, JSON_PRETTY_PRINT) .
            '\';
try {
  $hidden = json_decode($data, true, 512, JSON_THROW_ON_ERROR);
} catch (JsonException $e) {
  $hidden = ["error" => $e->getMessage(), "data" => $data];
}
';
        // step 3: write
        $res = file_put_contents($this->configFile, $out);
        if ($res === false && !is_writeable($this->configFile)) {
            throw new Exception("Configuration file is not writeable", 403);
        }

        // step 4: read it in, so that the user sees it
        $this->load();
    }

    protected function getSection($name)
    {
        if ($name === "*") {
            // return everything
            return $this->hidden;
        }
        return array_key_exists($name, $this->hidden)
            ? $this->hidden[$name]
            : null;
    }

    public function createHiddenConfig(
        ServerRequestInterface $request,
        ResponseInterface $response,
        array $args
    ) {
        $section = $args["section"];
        $key = $args["key"];
        // TODO: sanitize key / value
        $value = $request->getParsedBody();

        if (!array_key_exists($section, $this->hidden)) {
            $this->hidden[$section] = [];
        } elseif (array_key_exists($key, $this->config[$section])) {
            return Helper::withJson(
                $response,
                ["message" => "Config option already exists"],
                406
            );
        }
        $this->hidden[$section][$key] = $value;
        try {
            $this->dump();
        } catch (Exception $e) {
            return Helper::withJson(
                $response,
                ["message" => $e->getMessage()],
                $e->getCode()
            );
        }
        return $response->withStatus(200);
    }

    public function deleteHiddenConfig(
        ServerRequestInterface $request,
        ResponseInterface $response,
        array $args
    ) {
        $section = $args["section"];
        $key = $args["key"];
        if ($key === "*") {
            $key = null;
        }
        if (array_key_exists($section, $this->hidden)) {
            if ($key) {
                if (array_key_exists($key, $this->hidden[$section])) {
                    unset($this->hidden[$section][$key]);
                } else {
                    return Helper::withJson(
                        $response,
                        ["message" => "Config option not found"],
                        403
                    );
                }
            } else {
                // delete complete section
                unset($this->hidden[$section]);
            }
            try {
                $this->dump();
            } catch (Exception $e) {
                return Helper::withJson(
                    $response,
                    ["message" => $e->getMessage()],
                    $e->getCode()
                );
            }
            return $response->withStatus(200);
        } else {
            return Helper::withJson(
                $response,
                ["message" => "Config option not found"],
                403
            );
        }
    }

    public function getHiddenConfig(
        ServerRequestInterface $request,
        ResponseInterface $response,
        array $args
    ) {
        $sectionName = $args["section"];
        $key = $args["key"];
        if ($key === "*") {
            $key = null;
        }

        $section = $this->getSection($sectionName);
        if ($section && (!$key || array_key_exists($key, $section))) {
            if (!$key) {
                return Helper::withJson($response, $section);
            } else {
                return Helper::withJson($response, $section[$key]);
            }
        } else {
            return Helper::withJson(
                $response,
                ["message" => "Config option not found"],
                404
            );
        }
    }

    public function saveHiddenConfig(
        ServerRequestInterface $request,
        ResponseInterface $response,
        array $args
    ) {
        $this->hidden = $request->getParsedBody();
        try {
            $this->dump();
        } catch (Exception $e) {
            return Helper::withJson(
                $response,
                ["message" => $e->getMessage()],
                $e->getCode()
            );
        }
        return $response->withStatus(200);
    }

    public function updateHiddenConfig(
        ServerRequestInterface $request,
        ResponseInterface $response,
        array $args
    ) {
        $section = addcslashes($args["section"], $this->escapeChars);
        $key = addcslashes($args["key"], $this->escapeChars);
        // TODO: sanitize key / value
        $value = addcslashes($request->getParsedBody(), $this->escapeChars);

        if (
            array_key_exists($section, $this->hidden) &&
            array_key_exists($key, $this->hidden[$section])
        ) {
            $this->hidden[$section][$key] = $value;
            try {
                $this->dump();
            } catch (Exception $e) {
                return Helper::withJson(
                    $response,
                    ["message" => $e->getMessage()],
                    $e->getCode()
                );
            }
        } else {
            return Helper::withJson(
                $response,
                ["message" => "Config option not found"],
                403
            );
        }
    }
}
