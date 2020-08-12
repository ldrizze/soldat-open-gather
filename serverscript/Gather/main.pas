var
  serverToken: String;
  serverURL: String;
  serverIp: String;
  gamePrepared: Boolean;
  rounds: Boolean;

procedure breathe ();
var status: String;
begin
  status := sendCommand(
    '!breathe ' + serverIp + ' ' + Game.ServerPort + ' ' + parseGameStyle() + ' ' + Game.ServerName
  );

  if (status = 'waiting_server') and (gamePrepared <> True) then prepareGame();
end;

function sendCommand (command: String): String;
begin
  Result := GetURL(
    serverURL + '/command?command=' + HTTPEncode(command) + '&token=' + serverToken
  );
end;

procedure clockTick ();
begin
  breathe();
end;

function parseGameStyle (): String;
begin
  if Game.GameStyle = 'Team Match' then Result := 'tm';
  else Result := 'ctf';
end;

procedure  beforeMapChange(next: String);
  var Score: Byte;
begin
  Score := Game.Teams[1].Score + Game.Teams[2].Score
  if (Game.ScoreLimit = Score) or (Game.TimeLeft := 0) then begin
    sendMapStatistics();

    if rounds then gamePrepared := false;

    rounds := not rounds;
  end;
end;

// !round map score_alpha score_bravo steam_id_player_1|score_player_1 ... steam_id_player_6|score_player_6
procedure sendMapStatistics ();
  var command: String;
      i,j: Byte;
      player: TActivePlayer;
begin
  command := '!round ' +
  serverIp + ' ' +
  Game.ServerPort + ' ' +
  Game.CurrentMap + ' ' +
  Game.Teams[1].Score + ' ' +
  Game.Teams[2].Score;

  for j := 1 to 2 do
    for i := 0 to 2 do begin
      player := TActivePlayer(Game.Teams[j].Players[i]);
      command := command + ' ' +
      player.SteamIDString + '|' + player.Kills + '|' + player.Deaths;

  sendCommand(command);
end;

procedure playerAuth (Player: TActivePlayer; pin: String);
begin
  sendCommand(
    '!playerauth ' +
    pin + ' ' +
    Player.SteamIDString
  );
end;

function checkAuth (Player: TActivePlayer): Boolean;
var isAuth: Boolean;
    commandResult: String;
begin
  isAuth := False;
  commandResult := sendCommand('!checkplayerauth ' + Player.SteamIDString);
  if commandResult == '1' then isAuth := true;
  Result := isAuth;
end;

procedure prepareGame ();
begin
  Map.SetMap('Lobby');
  Game.Password := IntToStr(Random(100, 998));
  sendCommand(
    '!serverready ' +
    serverIp + ' ' +
    Game.ServerPort + ' ' +
    Game.Password
  );
  gamePrepared := True;
end;

begin
  gamePrepared := False;
  serverToken := ReadINI(Script.Dir + 'config.ini', 'Server', 'token', '-');
  serverURL   := ReadINI(Script.Dir + 'config.ini', 'Server', 'url', '-');
  serverURL   := ReadINI(Script.Dir + 'config.ini', 'Server', 'ip', '-');
  Game.TickThreshold := 60 * 60; // 1 minute
  Game.OnClockTick := @clockTick;
  Map.OnBeforeMapChange := @beforeMapChange;
  breathe();
end.
