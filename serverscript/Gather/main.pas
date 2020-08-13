var
  serverToken: String;
  serverURL: String;
  mainServerIp: String;
  gamePrepared: Boolean;
  rounds: Boolean;

function sendCommand (command: String): String;
begin
  WriteLn('Sending command: ' + command);
  try
    Result := GetURL(
      serverURL + '/command?command=' + HTTPEncode(command) + '&token=' + serverToken
    );
  except
    WriteLn('Could not possible call command, maybe wrong token or offline server?!');
    Result := '-'
  end;
end;

function parseGameStyle (): String;
begin
  if Game.GameStyle = 2 then Result := 'tm'
  else Result := 'ctf';
end;

procedure prepareGame ();
begin
  Map.SetMap('Lobby');
  Game.Password := IntToStr(Random(100, 998));
  sendCommand(
    '!serverready ' +
    mainServerIp + ' ' +
    IntToStr(Game.ServerPort) + ' ' +
    Game.Password
  );
  gamePrepared := True;
end;

// !round map score_alpha score_bravo steam_id_player_1|score_player_1 ... steam_id_player_6|score_player_6
procedure sendMapStatistics ();
  var command: String;
      i,j: Byte;
      player: TActivePlayer;
begin
  command := '!round ' +
  mainServerIp + ' ' +
  IntToStr(Game.ServerPort) + ' ' +
  Game.CurrentMap + ' ' +
  IntToStr(Game.Teams[1].Score) + ' ' +
  IntToStr(Game.Teams[2].Score);

  for j := 1 to 2 do
    for i := 0 to Game.Teams[j].Count -1 do begin
      WriteLn(Game.Teams[j].Player[i].Name)
      player := TActivePlayer(Game.Teams[j].Player[i]);
      command := command + ' ' +
      player.SteamIDString + '|' + IntToStr(player.Kills) + '|' + IntToStr(player.Deaths);
    end;

  WriteLn('command until now: ' + command)
  sendCommand(command);
end;

procedure breathe ();
var status: String;
begin
  status := sendCommand(
    '!breathe ' + mainServerIp + ' ' + IntToStr(Game.ServerPort) + ' ' + parseGameStyle() + ' ' + Game.ServerName
  );
  WriteLn('Status: ' + status)
  if (status = 'waiting_server') and (gamePrepared <> True) then prepareGame();
  if (status = 'waiting') then begin
    rounds := False;
    gamePrepared := False;
  end;
end;

procedure clockTick (Ticks: Integer);
begin
  breathe();
end;

procedure  beforeMapChange(next: String);
  var Score: Byte;
begin
  Score := Game.Teams[1].Score + Game.Teams[2].Score
  if (Game.ScoreLimit = Score) or (Game.TimeLeft = 0) then begin
    sendMapStatistics();

    if rounds then gamePrepared := false;

    rounds := not rounds;
  end;
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
  if commandResult = '1' then isAuth := true;
  Result := isAuth;
end;

begin
  gamePrepared := False;
  serverToken := ReadINI(Script.Dir + 'config.ini', 'Server', 'token', '-');
  serverURL   := ReadINI(Script.Dir + 'config.ini', 'Server', 'url', '-');
  mainServerIp   := ReadINI(Script.Dir + 'config.ini', 'Server', 'ip', '-');

  if not (serverToken = '-') and
     not (serverURL = '-') and
     not (mainServerIp = '-') then begin
    Game.TickThreshold := 60 * 5; // 1 minute
    Game.OnClockTick := @clockTick;
    Map.OnBeforeMapChange := @beforeMapChange;
    breathe();
  end else begin
    WriteLn('Server configuration mismatch');
    WriteLn('serverToken' + serverToken);
    WriteLn('serverURL' + serverURL);
    WriteLn('mainServerIp' + mainServerIp);
  end;
end.
